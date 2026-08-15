"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function ThemeToggle({ ar = false }: { ar?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    const applyTheme = () => {
      root.classList.add("themeTransitioning");
      root.dataset.theme = next ? "dark" : "light";
      localStorage.setItem("memories-theme", next ? "dark" : "light");
      window.setTimeout(() => root.classList.remove("themeTransitioning"), 520);
    };
    const transitionDocument = document as ViewTransitionDocument;
    if (transitionDocument.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      transitionDocument.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }
  return <button className="themeToggle" type="button" onClick={toggle} aria-label={ar ? (dark ? "استخدم الوضع الفاتح" : "استخدم الوضع الداكن") : (dark ? "Use light mode" : "Use dark mode")} title={ar ? "تغيير المظهر" : "Change theme"}>{dark ? <Sun /> : <Moon />}</button>;
}
