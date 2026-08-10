"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface DarkModeContextType {
  isDark: boolean;
  toggleDark: () => void;
  mapFillColor: string;
  mapStrokeColor: string;
  setMapFillColor: (c: string) => void;
  setMapStrokeColor: (c: string) => void;
}

const DarkModeContext = createContext<DarkModeContextType | null>(null);

const DEFAULTS = {
  dark: { fill: "var(--map-fill)", stroke: "var(--map-stroke)" },
  light: { fill: "var(--map-fill)", stroke: "var(--map-stroke)" },
};

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [mapFillColor, setMapFillColor] = useState(DEFAULTS.dark.fill);
  const [mapStrokeColor, setMapStrokeColor] = useState(DEFAULTS.dark.stroke);
  const [mounted, setMounted] = useState(false);

  // Single effect on mount — read localStorage, apply class, set all state atomically
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored !== null ? stored === "dark" : true;

    setIsDark(dark);
    setMapFillColor(dark ? DEFAULTS.dark.fill : DEFAULTS.light.fill);
    setMapStrokeColor(dark ? DEFAULTS.dark.stroke : DEFAULTS.light.stroke);
    document.documentElement.classList.toggle("dark", dark);
    setMounted(true);
  }, []);

  // Sync class and localStorage whenever isDark changes after mount
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  const toggleDark = () => {
    setIsDark((v) => {
      const next = !v;
      console.log(next);
      setMapFillColor(next ? DEFAULTS.light.fill : DEFAULTS.dark.fill);
      setMapStrokeColor(next ? DEFAULTS.dark.stroke : DEFAULTS.light.stroke);
      return next;
    });
  };

  return (
    <DarkModeContext.Provider
      value={{
        isDark,
        toggleDark,
        mapFillColor,
        mapStrokeColor,
        setMapFillColor,
        setMapStrokeColor,
      }}
    >
      <div suppressHydrationWarning>{children}</div>
    </DarkModeContext.Provider>
  );
}

export function useDarkMode(): DarkModeContextType {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error("useDarkMode must be inside DarkModeProvider");
  return ctx;
}
