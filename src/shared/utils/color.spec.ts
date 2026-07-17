import { describe, it, expect } from 'vitest';

import { invertLightnessForDarkMode } from './color';

describe('invertLightnessForDarkMode', () => {
  it('flips near-black text toward near-white', () => {
    expect(invertLightnessForDarkMode('#1a1a1a')).toBe('#e5e5e5');
  });

  it('flips near-white text toward near-black', () => {
    expect(invertLightnessForDarkMode('#faf8f5')).toBe('#0a0805');
  });

  it('is its own inverse (round-trips back to the original)', () => {
    const flipped = invertLightnessForDarkMode('#722f37');
    expect(invertLightnessForDarkMode(flipped)).toBe('#722f37');
  });

  it('returns the input unchanged for a non-hex value', () => {
    expect(invertLightnessForDarkMode('not-a-color')).toBe('not-a-color');
  });
});
