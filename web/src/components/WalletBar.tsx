'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { base } from 'viem/chains';
import {
  type Connector,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from 'wagmi';

export function WalletBar() {
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connectAsync, isPending: isConnectPending } =
    useConnect();
  const { disconnectAsync, isPending: isDisconnectPending } =
    useDisconnect();
  const { switchChainAsync, isPending: isSwitchPending } = useSwitchChain();

  const targetChainId = Number(
    process.env.NEXT_PUBLIC_CHAIN_ID ?? `${base.id}`,
  );
  const wrongNetwork = isConnected && chainId !== targetChainId;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const short =
    address != null
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : undefined;

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 bg-black/40 px-4 py-3 backdrop-blur-md">
      <div className="font-display text-lg tracking-wide text-cyan-200">
        Neon Simon
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {wrongNetwork ? (
          <div
            className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
            role="status"
          >
            <span>Wrong network — switch to Base.</span>
            <button
              type="button"
              className="rounded-md bg-amber-400 px-2 py-1 font-mono text-black hover:bg-amber-300"
              disabled={isSwitchPending}
              onClick={() =>
                switchChainAsync({ chainId: targetChainId as typeof base.id })
              }
            >
              {isSwitchPending ? 'Switching…' : 'Switch to Base'}
            </button>
          </div>
        ) : null}
        {isConnected && short ? (
          <>
            <span className="font-mono text-xs text-fuchsia-200">{short}</span>
            <button
              type="button"
              className="rounded-lg border border-fuchsia-500/40 px-3 py-2 font-mono text-xs text-fuchsia-100 hover:bg-fuchsia-500/10"
              disabled={isDisconnectPending}
              onClick={() => disconnectAsync()}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 font-mono text-sm font-semibold text-black shadow-[0_0_20px_rgba(34,211,238,0.45)]"
            disabled={isConnectPending}
            onClick={() => setSheetOpen(true)}
          >
            Connect wallet
          </button>
        )}
      </div>
      {mounted && sheetOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 sm:items-center"
              aria-modal="true"
              role="dialog"
              aria-label="Choose a wallet"
            >
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label="Close wallet picker"
                onClick={() => setSheetOpen(false)}
              />
              <div
                className="relative z-[10000] max-h-[70dvh] w-full max-w-md overflow-hidden rounded-t-2xl border border-cyan-500/30 bg-[#06060c] shadow-[0_0_40px_rgba(236,72,153,0.25)] sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span className="font-display text-cyan-200">
                    Connect wallet
                  </span>
                  <button
                    type="button"
                    className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                    aria-label="Close"
                    onClick={() => setSheetOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <ul className="max-h-[50dvh] list-none space-y-1 overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  {connectors.length === 0 ? (
                    <li className="px-2 py-4 text-sm text-zinc-400">
                      No wallet connectors in this browser. Open in a wallet
                      in-app browser or install an extension.
                    </li>
                  ) : (
                    connectors.map((c: Connector) => (
                      <li key={c.uid}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left font-mono text-sm text-zinc-100 hover:border-cyan-400/40 hover:bg-cyan-500/10"
                          disabled={isConnectPending}
                          onClick={async () => {
                            try {
                              await connectAsync({
                                connector: c,
                                chainId: targetChainId as typeof base.id,
                              });
                              setSheetOpen(false);
                            } catch {
                              /* user rejected or connector error */
                            }
                          }}
                        >
                          {c.name}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
