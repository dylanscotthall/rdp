"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { THEME_KEY } from "@/app/lib/theme";

interface DarkModeContextType {
  isDark: boolean;
  toggleDark: () => void;
  mapFillColor: string;
  mapStrokeColor: string;
}

const DarkModeContext = createContext<DarkModeContextType | null>(null);

// The CSS variables switch with the .dark class, so the map colours never change
const MAP_FILL_COLOR = "var(--map-fill)";
const MAP_STROKE_COLOR = "var(--map-stroke)";

// The saved theme lives in localStorage; useSyncExternalStore reads it
// without a hydration mismatch (the server always renders dark).
const themeListeners = new Set<() => void>();

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getIsDark() {
  return localStorage.getItem(THEME_KEY) !== "light";
}

function getServerIsDark() {
  return true;
}

function saveTheme(dark: boolean) {
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  themeListeners.forEach((listener) => listener());
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getIsDark,
    getServerIsDark,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleDark = () => saveTheme(!isDark);

  return (
    <DarkModeContext.Provider
      value={{
        isDark,
        toggleDark,
        mapFillColor: MAP_FILL_COLOR,
        mapStrokeColor: MAP_STROKE_COLOR,
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
