import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ACCENTS, DEFAULT_THEME, THEME_STORAGE_KEY, validateTheme } from './settings';
import type { ThemeSettings } from './settings';
import { ThemeContext } from './useTheme';

function readTheme() {
  try { return validateTheme(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || 'null')); }
  catch { return DEFAULT_THEME; }
}
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(readTheme);
  const systemDark = useMedia('(prefers-color-scheme: dark)');
  const systemReducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const dark = settings.mode === 'dark' || (settings.mode === 'system' && systemDark);
  const reducedMotion = settings.reducedMotion || systemReducedMotion;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.accent = settings.accent;
    root.dataset.density = settings.density;
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
    root.style.fontSize = `${settings.fontSize}px`;
    root.style.colorScheme = dark ? 'dark' : 'light';
    try { localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings)); } catch { /* Private browsing can block storage. */ }
  }, [settings, dark, reducedMotion]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      try { setSettings(validateTheme(JSON.parse(event.newValue || 'null'))); } catch { setSettings(DEFAULT_THEME); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <ThemeContext.Provider value={{ settings, update: patch => setSettings(current => validateTheme({ ...current, ...patch })), reset: () => setSettings(DEFAULT_THEME), reducedMotion, systemReducedMotion, dark, colors: ACCENTS[settings.accent].colors }}>{children}</ThemeContext.Provider>;
}
