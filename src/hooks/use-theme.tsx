"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface UseTheme {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function useTheme(): UseTheme {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    setTheme(storedTheme || "system");
  }, []);

  useEffect(() => {
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };
}
