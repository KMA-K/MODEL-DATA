export const ACCENTS = {
  emerald: { label: 'Lục bảo', swatch: '#10b981', colors: ['#059669', '#34d399', '#6ee7b7', '#0d9488', '#a7f3d0', '#64748b'] },
  indigo: { label: 'Indigo', swatch: '#818cf8', colors: ['#6366f1', '#a5b4fc', '#c4b5fd', '#8b5cf6', '#ddd6fe', '#64748b'] },
  coral: { label: 'San hô', swatch: '#fb7185', colors: ['#e11d48', '#fb923c', '#fda4af', '#f97316', '#fecdd3', '#64748b'] },
  ocean: { label: 'Đại dương', swatch: '#38bdf8', colors: ['#0284c7', '#38bdf8', '#7dd3fc', '#0891b2', '#bae6fd', '#64748b'] },
  amber: { label: 'Hoàng kim', swatch: '#fbbf24', colors: ['#d97706', '#fbbf24', '#fde68a', '#b45309', '#fef3c7', '#64748b'] },
} as const;

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  accent: keyof typeof ACCENTS;
  density: 'comfortable' | 'compact';
  fontSize: 16 | 18 | 20;
  reducedMotion: boolean;
}
export const THEME_STORAGE_KEY = 'banhang-theme-v1';
export const DEFAULT_THEME: ThemeSettings = { mode: 'system', accent: 'emerald', density: 'comfortable', fontSize: 16, reducedMotion: false };

export function validateTheme(value: unknown): ThemeSettings {
  const item = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    mode: ['light', 'dark', 'system'].includes(String(item.mode)) ? item.mode as ThemeSettings['mode'] : DEFAULT_THEME.mode,
    accent: Object.hasOwn(ACCENTS, String(item.accent)) ? item.accent as ThemeSettings['accent'] : DEFAULT_THEME.accent,
    density: item.density === 'compact' ? 'compact' : 'comfortable',
    fontSize: [16, 18, 20].includes(Number(item.fontSize)) ? Number(item.fontSize) as ThemeSettings['fontSize'] : 16,
    reducedMotion: item.reducedMotion === true,
  };
}
