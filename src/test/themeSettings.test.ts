import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, validateTheme } from '../theme/settings';
describe('Stored theme recovery', () => {
  it('recovers valid individual fields while discarding corrupt settings', () => {
    expect(validateTheme({ mode: 'purple', accent: '__proto__', fontSize: 500, reducedMotion: 'false', density: 'compact' })).toEqual({ ...DEFAULT_THEME, density: 'compact' });
    expect(validateTheme(null)).toEqual(DEFAULT_THEME);
  });
});
