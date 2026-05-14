'use client';

import type { Direction } from '@/lib/simon/swipeClassifier';

const FREQ: Record<Direction, number> = {
  0: 392,
  1: 523,
  2: 659,
  3: 784,
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Short neon blip for Simon cue / input confirm (no external assets). */
export function playDirectionTone(
  dir: Direction,
  reducedMotion: boolean,
): void {
  const c = getCtx();
  if (!c) return;
  void c.resume();
  const dur = reducedMotion ? 0.06 : 0.11;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = FREQ[dir];
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playLowBuzz(reducedMotion: boolean): void {
  const c = getCtx();
  if (!c) return;
  void c.resume();
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = reducedMotion ? 110 : 95;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.16);
}
