import { describe, expect, it } from 'vitest';
import { classifySwipe, sequenceLengthForLevel } from './swipeClassifier';

describe('classifySwipe', () => {
  it('returns null when movement is tiny', () => {
    expect(classifySwipe({ dx: 2, dy: 3 })).toBeNull();
  });

  it('maps dominant horizontal right', () => {
    expect(classifySwipe({ dx: 80, dy: 10 }, 20)).toBe(1);
  });

  it('maps dominant horizontal left', () => {
    expect(classifySwipe({ dx: -90, dy: 5 }, 20)).toBe(3);
  });

  it('maps dominant vertical down', () => {
    expect(classifySwipe({ dx: 4, dy: 100 }, 20)).toBe(2);
  });

  it('maps dominant vertical up', () => {
    expect(classifySwipe({ dx: -3, dy: -88 }, 20)).toBe(0);
  });
});

describe('sequenceLengthForLevel', () => {
  it('matches plan (L1 → 3)', () => {
    expect(sequenceLengthForLevel(1)).toBe(3);
    expect(sequenceLengthForLevel(2)).toBe(4);
  });
});
