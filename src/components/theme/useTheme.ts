"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  readThemePreference,
  resolvedTheme,
  type ThemePreference,
} from "./theme";

/** Client-only: the editor is never server-rendered, so reading the DOM in the initializer is safe. */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    typeof window === "undefined" ? "system" : readThemePreference(),
  );
  const [theme, setTheme] = useState(() =>
    typeof window === "undefined" ? "light" : resolvedTheme(preference),
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      applyTheme(preference);
      setTheme(resolvedTheme(preference));
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [preference]);

  return { theme, preference, setPreference };
}
