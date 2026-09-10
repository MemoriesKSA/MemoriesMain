"""Crawls the live site and reports every image that fails and every placeholder shown.

check-images.ts reads the source, which proves a referenced file exists. It
cannot see what a visitor sees: a component that renders a camera placeholder
because a place has no photograph, an image URL built at runtime, or a page the
optimiser fails on. This walks the site the way a visitor would, from the home
pages outward, and checks what actually came back.

    python scripts/crawl-live-images.py
    python scripts/crawl-live-images.py https://memories.tours --max-pages 2000

Fetched with curl, not urllib: urllib cannot reach external hosts from this
machine. A placeholder is detected by the Camera icon, which is what both
ImageSlot and Photo render when there is no picture.
"""

import html
import json
import re
import subprocess
import sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import unquote, urljoin, urlparse

BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "https://memories.tours").rstrip("/")
MAX_PAGES = int(sys.argv[sys.argv.index("--max-pages") + 1]) if "--max-pages" in sys.argv else 1500
UA = "MemoriesSiteSweep/1.0 (+https://memories.tours)"

# Pages a visitor cannot reach without a token or a login, or that are not pages.
SKIP = re.compile(r"^/(_next|api|internal|journey)(/|$)|\.(xml|txt|ico|png|jpe?g|webp|svg|pdf)$", re.I)

HREF = re.compile(r'href="([^"#]+)"')
IMG = re.compile(r'<img\b[^>]*?\ssrc="([^"]+)"', re.I)
SRCSET = re.compile(r'srcset="([^"]+)"', re.I)
CSS_URL = re.compile(r'url\((?:&quot;|["\'])?(/[^)"\'&]+?\.(?:webp|png|jpe?g|avif|svg))', re.I)
PLACEHOLDER = re.compile(r'<div class="([^"]*)" role="img" aria-label="([^"]*)"><svg[^>]*lucide-camera', re.I)


def fetch(url: str, body: bool = True) -> tuple[int, str]:
    cmd = ["curl", "-sS", "--compressed", "--max-time", "45", "-A", UA, "-o", "-" if body else "NUL" if sys.platform == "win32" else "/dev/null", "-w", "\n%{http_code}", url]
    if not body:
        cmd[1:1] = ["-r", "0-0"]
    result = subprocess.run(cmd, capture_output=True)
    out = result.stdout.decode("utf-8", errors="replace")
    text, _, code = out.rpartition("\n")
    try:
        return int(code.strip()), text
    except ValueError:
        return 0, text


def normalise(href: str) -> str | None:
    href = html.unescape(href)
    url = urlparse(urljoin(BASE + "/", href))
    # tel: and mailto: links are not pages. The first crawl followed the Saudi
    # emergency numbers (993, 997, 998, 999) and reported them as broken pages.
    if url.scheme not in ("http", "https") or url.netloc != urlparse(BASE).netloc:
        return None
    path = url.path.rstrip("/") or "/"
    return None if SKIP.search(path) else path


def images_in(page_html: str) -> set[str]:
    # srcset is deliberately not expanded. Every width in it is a separate
    # optimiser transformation on Vercel, which is metered, and a crawl that
    # requested all of them would create hundreds of new ones to prove nothing
    # the src and the underlying file do not already prove.
    found = set(IMG.findall(page_html))
    found.update(CSS_URL.findall(page_html))
    return {html.unescape(u) for u in found if u and not u.startswith("data:")}


def underlying(src: str) -> str:
    """The /images/... file behind a /_next/image URL, for readable reporting."""
    m = re.search(r"[?&]url=([^&]+)", src)
    return unquote(m.group(1)) if "/_next/image" in src and m else src


def main():
    seen, queue = set(), ["/", "/ar", "/destinations", "/ar/destinations"]
    pages, bad_pages = {}, {}
    image_pages = defaultdict(set)
    placeholders = defaultdict(list)

    with ThreadPoolExecutor(max_workers=8) as pool:
        while queue and len(seen) < MAX_PAGES:
            batch = [p for p in dict.fromkeys(queue) if p not in seen][: MAX_PAGES - len(seen)]
            queue = []
            seen.update(batch)
            for path, (code, body) in zip(batch, pool.map(lambda p: fetch(BASE + p), batch)):
                if code != 200:
                    bad_pages[path] = code
                    continue
                pages[path] = True
                for href in HREF.findall(body):
                    target = normalise(href)
                    if target and target not in seen:
                        queue.append(target)
                for src in images_in(body):
                    image_pages[urljoin(BASE + path, src)].add(path)
                for cls, label in PLACEHOLDER.findall(body):
                    placeholders[path].append((cls, html.unescape(label)))

        urls = sorted(image_pages)
        codes = dict(zip(urls, pool.map(lambda u: fetch(u, body=False)[0], urls)))

    broken = {u: c for u, c in codes.items() if c not in (200, 206)}
    by_file = defaultdict(set)
    for u in urls:
        by_file[underlying(u.replace(BASE, ""))].add(u)

    print(f"pages crawled: {len(pages)}  (non-200: {len(bad_pages)}; capped at {MAX_PAGES}: {'yes' if queue else 'no'})")
    for path, code in sorted(bad_pages.items()):
        print(f"  PAGE {code}  {path}")
    print(f"distinct image URLs: {len(urls)}  (underlying files: {len(by_file)})")
    print(f"broken image URLs: {len(broken)}")
    for u, c in sorted(broken.items()):
        where = sorted(image_pages[u])
        print(f"  {c}  {underlying(u.replace(BASE, ''))}   on {len(where)} page(s), e.g. {where[0]}")
    total = sum(len(v) for v in placeholders.values())
    print(f"placeholders shown: {total} across {len(placeholders)} page(s)")
    kinds = defaultdict(int)
    for items in placeholders.values():
        for cls, _ in items:
            kinds[cls] += 1
    for cls, n in sorted(kinds.items(), key=lambda kv: -kv[1]):
        print(f"  {n:5}  class=\"{cls}\"")
    for path, items in sorted(placeholders.items(), key=lambda kv: -len(kv[1]))[:15]:
        print(f"  {len(items):3}  {path}: {', '.join(label for _, label in items[:6])}{' ...' if len(items) > 6 else ''}")

    report = {
        "pages": sorted(pages), "badPages": bad_pages, "broken": broken,
        "placeholders": {p: [{"class": c, "label": l} for c, l in v] for p, v in placeholders.items()},
    }
    out = "crawl-live-images.json"
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=1)
    print(f"\nfull report: {out}")
    if broken or bad_pages:
        sys.exit(1)


if __name__ == "__main__":
    main()
