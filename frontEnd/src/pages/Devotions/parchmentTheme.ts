import { useCallback, useEffect, useState } from "react";

export interface ParchmentThemeState {
  dark: boolean;
}

const STORAGE_KEY = "prayer-book-theme";
const CHANGE_EVENT = "parchment-theme-change";

const DEFAULT_STATE: ParchmentThemeState = { dark: true };

function readState(): ParchmentThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    // Backward compat: we previously stored a bare "light" | "dark" string,
    // then a JSON object that also carried a palette field.
    if (raw === "dark") return { dark: true };
    if (raw === "light") return { dark: false };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.dark === "boolean") {
      return { dark: parsed.dark };
    }
    return DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: ParchmentThemeState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent<ParchmentThemeState>(CHANGE_EVENT, { detail: state }));
}

export function useParchmentTheme() {
  const [state, setState] = useState<ParchmentThemeState>(readState);

  useEffect(() => {
    const onChange = (e: Event) => {
      setState((e as CustomEvent<ParchmentThemeState>).detail);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setState((s) => {
      const next = { ...s, dark: !s.dark };
      writeState(next);
      return next;
    });
  }, []);

  const theme = state.dark ? "dark" : "light";

  return { theme, isDark: state.dark, toggleTheme };
}
