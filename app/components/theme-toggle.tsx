"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ ar = false }: { ar?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("memories-theme", next ? "dark" : "light");
  }
  return <button className="themeToggle" type="button" onClick={toggle} aria-label={ar ? (dark ? "استخدم الوضع الفاتح" : "استخدم الوضع الداكن") : (dark ? "Use light mode" : "Use dark mode")} title={ar ? "تغيير المظهر" : "Change theme"}>{dark ? <Sun /> : <Moon />}</button>;
}
