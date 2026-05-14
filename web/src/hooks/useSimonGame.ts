'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  classifySwipe,
  playbackDelayMs,
  sequenceLengthForLevel,
  type Direction,
  type SwipeVector,
} from '@/lib/simon/swipeClassifier';
import { playDirectionTone, playLowBuzz } from '@/lib/simon/audio';

export type GamePhase =
  | 'idle'
  | 'watching'
  | 'playing'
  | 'levelComplete'
  | 'gameOver';

type SimonState = {
  phase: GamePhase;
  level: number;
  score: number;
  sequence: Direction[];
  inputIndex: number;
  highlight: Direction | null;
  lastError: string | null;
};

const HIGH_SCORE_KEY = 'neon-simon-high';

export function useSimonGame() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const [state, setState] = useState<SimonState>({
    phase: 'idle',
    level: 1,
    score: 0,
    sequence: [],
    inputIndex: 0,
    highlight: null,
    lastError: null,
  });

  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const randomDirection = (): Direction =>
    (Math.floor(Math.random() * 4) as Direction);

  const buildSequence = useCallback(
    (level: number) => {
      const len = sequenceLengthForLevel(level);
      return Array.from({ length: len }, randomDirection);
    },
    [],
  );

  const playSequence = useCallback(
    (seq: Direction[], level: number) => {
      clearTimers();
      const stepMs = playbackDelayMs(level, reducedMotion);
      const flashMs = Math.min(420, Math.round(stepMs * 0.42));

      seq.forEach((dir, i) => {
        const onId = window.setTimeout(() => {
          setState((s) => ({ ...s, highlight: dir }));
          const offId = window.setTimeout(() => {
            setState((s) => ({ ...s, highlight: null }));
          }, flashMs);
          timersRef.current.push(offId);
        }, i * stepMs);
        timersRef.current.push(onId);
      });

      const doneId = window.setTimeout(() => {
        setState((s) => ({
          ...s,
          phase: 'playing',
          inputIndex: 0,
          highlight: null,
        }));
      }, seq.length * stepMs + flashMs + 40);
      timersRef.current.push(doneId);
    },
    [clearTimers, reducedMotion],
  );

  const startGame = useCallback(() => {
    clearTimers();
    const level = 1;
    const seq = buildSequence(level);
    setState({
      phase: 'watching',
      level,
      score: 0,
      sequence: seq,
      inputIndex: 0,
      highlight: null,
      lastError: null,
    });
    playSequence(seq, level);
  }, [buildSequence, clearTimers, playSequence]);

  const retry = useCallback(() => {
    clearTimers();
    setState({
      phase: 'idle',
      level: 1,
      score: 0,
      sequence: [],
      inputIndex: 0,
      highlight: null,
      lastError: null,
    });
  }, [clearTimers]);

  /* Level-up: brief celebration then next sequence */
  useEffect(() => {
    if (state.phase !== 'levelComplete') return;
    const id = window.setTimeout(() => {
      const nextLevel = state.level;
      const seq = buildSequence(nextLevel);
      setState((s) => ({
        ...s,
        phase: 'watching',
        sequence: seq,
        inputIndex: 0,
        lastError: null,
      }));
      playSequence(seq, nextLevel);
    }, reducedMotion ? 380 : 900);
    return () => window.clearTimeout(id);
  }, [state.phase, state.level, buildSequence, playSequence, reducedMotion]);

  const submitSwipe = useCallback(
    (vec: SwipeVector) => {
      if (state.phase !== 'playing') return;
      const dir = classifySwipe(vec);
      if (dir === null) return;

      const expected = state.sequence[state.inputIndex];
      if (dir !== expected) {
        clearTimers();
        playLowBuzz(reducedMotion);
        setState((s) => ({
          ...s,
          phase: 'gameOver',
          lastError: 'Pattern mismatch — grid reset.',
        }));
        return;
      }

      playDirectionTone(dir, reducedMotion);

      const nextIndex = state.inputIndex + 1;
      const cleared = nextIndex >= state.sequence.length;
      const afterStepScore = state.score + 10;
      if (!cleared) {
        setState((s) => ({
          ...s,
          inputIndex: nextIndex,
          score: afterStepScore,
        }));
        return;
      }

      const newLevel = state.level + 1;
      const newScore = afterStepScore + 50;
      const prevHigh = Number(
        window.localStorage.getItem(HIGH_SCORE_KEY) ?? '0',
      );
      if (newScore > prevHigh) {
        window.localStorage.setItem(HIGH_SCORE_KEY, String(newScore));
      }

      clearTimers();
      setState({
        phase: 'levelComplete',
        level: newLevel,
        score: newScore,
        sequence: state.sequence,
        inputIndex: 0,
        highlight: null,
        lastError: null,
      });
    },
    [state, clearTimers, reducedMotion],
  );

  return { state, startGame, retry, submitSwipe, reducedMotion };
}
