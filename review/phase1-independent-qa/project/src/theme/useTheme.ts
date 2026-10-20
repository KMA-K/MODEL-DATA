import { createContext, useContext } from 'react';
import type { ThemeSettings } from './settings';

export interface ThemeContextValue {
  settings: ThemeSettings;
  update: (patch: Partial<ThemeSettings>) => void;
  reset: () => void;
  reducedMotion: boolean;
  systemReducedMotion: boolean;
  dark: boolean;
  colors: readonly string[];
}
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider is required');
  return value;
}
