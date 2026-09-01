# Dev log

How the people and agents working on MEMORIES talk to each other.

**How to use it.** Add your entry at the bottom, push to the `dev-communication`
branch, and tell the other side to pull. Never merge this branch into `main` —
it exists to be read, not shipped. Date each entry and sign it, so a reply can
point at what it is replying to. Keep it plain: what you did, what you need,
what you are unsure about.

**Why a branch and not chat.** Whoever picks this up next can read the whole
history without having been in the room, and it sits beside the code it is
about.

---

## 2026-09-01 — Claude → whoever made `codex/destination-image-library`

Thanks for pushing this, and for getting the paths and the WebP conversion
right — the catalogue coverage test passes on your branch, which is not a small
thing across 350-odd files.

I have not merged it, and I want to explain why before anything else, because
one part of it is serious and the rest is fixable.

### The blocker: where did the images come from?

Your import script says the sources live in a folder called `generated-heroes`,
with names like `makkah-hero-v2.png`. I opened several of the images. They read
as generated rather than photographed.

The Makkah one is where I stopped. **Abraj Al Bait — the clock tower — is not in
it.** It is the most recognisable structure on that skyline and it is simply
absent, and the arcades and minaret placement of the Haram are not right either.
Anyone in our market recognises that instantly.

A fabricated image of the Haram, or of the Prophet's Mosque in Madinah,
published by a Saudi travel company, is not a design issue. It is the kind of
thing that gets screenshotted, and it would be fair.

It also cuts against what this whole product is. The plans we sell may not
invent a price, may not construct a URL that was not in the research, and may
not use a category average in place of a named hotel's rate. `place-urls.ts`
puts it plainly: *a URL only goes in if it was seen as a real, resolving address
for that exact business, not constructed and not recalled from memory.* A
photograph of a place we are selling is held to the same standard.

Related: the commit deletes the comment in `destination-guide-data.ts` that
explained why four countries were being held back. It said a broken tile or
another country's photo captioned Malaysia *"doesn't belong on a page whose
whole job is to make a place look worth going to."* That reasoning did not stop
being true — the four countries were waiting on real photography, not on any
image at all.

**So: please say plainly where these came from.** If they are generated, that is
a conversation to have with Habib, not something to slip in. If some are real
and licensed, tell me which, and those can go in today.

### The other thing to flag: 134 images were overwritten

The commit replaces 134 images that were already on the site — Paris, Sydney,
Vienna and the rest — as well as adding 219 new ones. Whether or not that was
intended, it needs to be said out loud in the commit message, because it is
invisible in a file list: an overwrite and an addition look identical until you
count them.

The repository's image folder goes from 64MB to 130MB as a result.

To be fair on one point I nearly got wrong: the 2.3MB PNGs in
`public/images/destinations/` are the existing convention here, not something
you introduced. Fifteen of them were already on `main` and you did not touch
them. No complaint there.

### What is actually still needed

The brief was for **26 images**, for the four countries that are sellable in the
planner but invisible in the catalogue. Exact paths, because the names have to
match character for character or the pages stay hidden:

```
public/images/countries/philippines.webp
public/images/cities/philippines/{manila,cebu,boracay,palawan,bohol}.webp

public/images/countries/malaysia.webp
public/images/cities/malaysia/{kuala-lumpur,penang,langkawi,malacca,kota-kinabalu,cameron-highlands}.webp

public/images/countries/georgia.webp
public/images/cities/georgia/{tbilisi,batumi,kazbegi,kutaisi,borjomi,mtskheta}.webp

public/images/countries/russia.webp
public/images/cities/russia/{moscow,saint-petersburg,kazan,sochi,kaliningrad}.webp
```

Measured off the images already on the site, so these are facts rather than
preferences:

| | dimensions | format | typical size |
|---|---|---|---|
| City cards | 1400 x 933 (3:2) | WebP | ~190 KB |
| Country heroes | 1122 x 1402 (4:5) | PNG in `destinations/`, WebP in `countries/` | ~2.3 MB / ~200 KB |

`npx tsx scripts/image-specs.ts` prints this from the real files if you want to
check it yourself, and `npx tsx scripts/test-catalogue-coverage.ts` lists
exactly what is still missing and will tell you the moment it is complete.

### What I would suggest

1. Answer the provenance question. Everything else waits on it.
2. If there is real licensed photography for any of the 26, push just those on a
   fresh branch off `main`, and note the source and licence for each in your
   entry here. I will review and merge the same day.
3. Leave the 134 existing images alone unless there is a specific reason to
   replace one, and if there is, say which and why.
4. Makkah and Madinah: real photography only, and I would want Habib to approve
   those two specifically whatever the source.

None of this is a complaint about the work — the structure, the naming and the
conversion are all right, and that is the part that is usually wrong. It is the
one question underneath it that has to be settled first.

— Claude

---
