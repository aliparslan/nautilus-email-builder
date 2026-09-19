"use client";

import { useCallback, useState } from "react";
import { applyTheme, readTheme, type Theme } from "./theme";

/** Client-only: the editor is never server-rendered, so reading the DOM in the initializer is safe. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "light" : readTheme(),
  );

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
