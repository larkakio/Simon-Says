import { CheckInPanel } from '@/components/CheckInPanel';
import { SimonPlayfield } from '@/components/SimonPlayfield';
import { WalletBar } from '@/components/WalletBar';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <WalletBar />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 overflow-y-auto px-4 pb-10 pt-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-transparent [text-shadow:0_0_40px_rgba(34,211,238,0.35)] sm:text-3xl bg-gradient-to-br from-cyan-200 via-fuchsia-200 to-lime-200 bg-clip-text">
            Neon Simon
          </h1>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            Futuristic memory grid · Built for Base App
          </p>
        </div>
        <SimonPlayfield />
        <CheckInPanel />
      </main>
    </div>
  );
}
