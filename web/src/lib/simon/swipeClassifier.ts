/** Swipe vector from pointer start to end (screen coords, +y down). */
export type SwipeVector = { dx: number; dy: number };

/** 0 up, 1 right, 2 down, 3 left — matches compass polish on playfield. */
export type Direction = 0 | 1 | 2 | 3;

const MIN_DISTANCE_PX = 28;

/**
 * Classifies a swipe into Up/Right/Down/Left using dominant axis.
 * Returns null if movement is too short (jitter guard).
 */
export function classifySwipe(
  { dx, dy }: SwipeVector,
  minDistance = MIN_DISTANCE_PX,
): Direction | null {
  const dist = Math.hypot(dx, dy);
  if (dist < minDistance) return null;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 1 : 3;
  }
  return dy > 0 ? 2 : 0;
}

/** Round length for Simon level N (plan: L1 → 3 steps). */
export function sequenceLengthForLevel(level: number): number {
  return 2 + level;
}

/** Inter-step delay for playback (ms), faster on higher levels with a floor. */
export function playbackDelayMs(level: number, reducedMotion: boolean): number {
  const base = reducedMotion ? 880 : 700;
  const factor = reducedMotion ? 0.96 : 0.92;
  const ms = base * Math.pow(factor, level - 1);
  return Math.max(reducedMotion ? 520 : 320, Math.round(ms));
}
