'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSimonGame } from '@/hooks/useSimonGame';
import type { Direction } from '@/lib/simon/swipeClassifier';
import { playDirectionTone } from '@/lib/simon/audio';

const SECTOR = [
  {
    dir: 0 as Direction,
    className:
      'bg-gradient-to-b from-cyan-400/50 to-cyan-900/20 border-cyan-300/60 shadow-[0_0_30px_rgba(34,211,238,0.35)]',
    position: 'col-start-2 row-start-1 translate-y-2',
  },
  {
    dir: 1 as Direction,
    className:
      'bg-gradient-to-l from-fuchsia-400/50 to-fuchsia-900/20 border-fuchsia-300/60 shadow-[0_0_30px_rgba(217,70,239,0.35)]',
    position: 'col-start-3 row-start-2 translate-x-2',
  },
  {
    dir: 2 as Direction,
    className:
      'bg-gradient-to-t from-orange-400/45 to-orange-950/25 border-orange-300/55 shadow-[0_0_30px_rgba(251,146,60,0.35)]',
    position: 'col-start-2 row-start-3 -translate-y-2',
  },
  {
    dir: 3 as Direction,
    className:
      'bg-gradient-to-r from-lime-400/45 to-lime-950/25 border-lime-300/55 shadow-[0_0_30px_rgba(163,230,53,0.35)]',
    position: 'col-start-1 row-start-2 -translate-x-2',
  },
] as const;

const LABELS = ['Up', 'Right', 'Down', 'Left'] as const;

export function SimonPlayfield() {
  const { state, startGame, retry, submitSwipe, reducedMotion } =
    useSimonGame();
  const ptr = useRef<{ x: number; y: number } | null>(null);
  const prevHighlight = useRef<Direction | null>(null);

  useEffect(() => {
    if (state.highlight === null) {
      prevHighlight.current = null;
      return;
    }
    if (prevHighlight.current !== state.highlight) {
      prevHighlight.current = state.highlight;
      playDirectionTone(state.highlight, reducedMotion);
    }
  }, [state.highlight, reducedMotion]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    ptr.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = ptr.current;
      ptr.current = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      submitSwipe({ dx, dy });
    },
    [submitSwipe],
  );

  const phaseLabel =
    state.phase === 'idle'
      ? 'Ready'
      : state.phase === 'watching'
        ? 'Watch the pulse'
        : state.phase === 'playing'
          ? 'Your turn — swipe'
          : state.phase === 'levelComplete'
            ? `Level ${state.level}`
            : 'Grid failed';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-[#030308]/90 p-4 shadow-[0_0_50px_rgba(34,211,238,0.12)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.45)_1px,transparent_1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-xs text-zinc-400">
          <span className="text-cyan-200">Level {state.level}</span>
          {' · '}
          <span className="text-fuchsia-200">Score {state.score}</span>
        </div>
        <div className="font-display text-sm uppercase tracking-[0.2em] text-lime-200/90">
          {phaseLabel}
        </div>
      </div>
      <p className="relative z-10 mb-4 text-center text-xs leading-relaxed text-zinc-400">
        Watch the neon pulse, then swipe <strong className="text-cyan-200">up</strong>,{' '}
        <strong className="text-fuchsia-200">right</strong>,{' '}
        <strong className="text-orange-200">down</strong>, or{' '}
        <strong className="text-lime-200">left</strong> on the field to mirror
        the pattern.
      </p>
      <div className="relative z-10 mx-auto aspect-square w-full max-w-[min(100%,380px)]">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center p-[6%]">
          {SECTOR.map(({ dir, className, position }) => {
            const hot = state.highlight === dir;
            return (
              <div
                key={dir}
                className={`pointer-events-none relative flex h-[78%] w-[78%] items-center justify-center rounded-2xl border-2 transition-transform duration-150 ${position} ${className} ${
                  hot ? 'scale-105 brightness-125' : 'scale-100'
                } ${reducedMotion ? '' : 'duration-200'}`}
              >
                <span
                  className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
                    hot ? 'text-white' : 'text-white/80'
                  }`}
                >
                  {LABELS[dir]}
                </span>
              </div>
            );
          })}
          <div className="pointer-events-none col-start-2 row-start-2 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-black/60 shadow-[inset_0_0_24px_rgba(34,211,238,0.15)]">
            <span className="font-display text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              Swipe
            </span>
          </div>
        </div>
        <div
          className="absolute inset-0 z-20 cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            ptr.current = null;
          }}
          style={{ touchAction: 'none' }}
          role="application"
          aria-label="Swipe field — mirror the Simon pattern"
        />
      </div>
      <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-2">
        {state.phase === 'idle' || state.phase === 'gameOver' ? (
          <>
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-orange-400 px-6 py-2.5 font-mono text-sm font-bold text-black shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              onClick={startGame}
            >
              {state.phase === 'gameOver' ? 'Try again' : 'Start run'}
            </button>
            {state.phase === 'gameOver' ? (
              <button
                type="button"
                className="rounded-xl border border-zinc-600 px-4 py-2 font-mono text-xs text-zinc-300"
                onClick={retry}
              >
                Reset
              </button>
            ) : null}
          </>
        ) : null}
      </div>
      {state.phase === 'gameOver' && state.lastError ? (
        <p className="relative z-10 mt-2 text-center font-mono text-xs text-red-400">
          {state.lastError}
        </p>
      ) : null}
      {state.phase === 'levelComplete' ? (
        <p className="relative z-10 mt-2 text-center font-mono text-sm text-lime-300">
          Sector sync locked — entering level {state.level}
        </p>
      ) : null}
    </section>
  );
}
