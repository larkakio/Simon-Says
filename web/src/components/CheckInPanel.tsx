'use client';

import { base } from 'viem/chains';
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';
import { getCheckInDataSuffix } from '@/lib/builder/dataSuffix';
import { checkInAbi, checkInContractAddress } from '@/lib/contracts/checkIn';

export function CheckInPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = checkInContractAddress();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const {
    writeContractAsync,
    isPending: isWriting,
    error: writeError,
    isSuccess,
    reset,
  } = useWriteContract();

  const targetChainId = base.id;

  const { data: streak, refetch } = useReadContract({
    address: contractAddress,
    abi: checkInAbi,
    functionName: 'streakCount',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(contractAddress && address) },
  });

  const wrongNetwork = isConnected && chainId !== targetChainId;
  const disabled =
    !isConnected ||
    !contractAddress ||
    !address ||
    isWriting ||
    isSwitching ||
    wrongNetwork;

  async function handleCheckIn() {
    if (!contractAddress) return;
    reset();
    if (chainId !== targetChainId) {
      await switchChainAsync({ chainId: targetChainId });
    }
    const dataSuffix = getCheckInDataSuffix();
    await writeContractAsync({
      address: contractAddress,
      abi: checkInAbi,
      functionName: 'checkIn',
      chainId: targetChainId,
      value: 0n,
      ...(dataSuffix ? { dataSuffix } : {}),
    });
    await refetch();
  }

  return (
    <section className="rounded-2xl border border-lime-400/25 bg-black/35 p-4 shadow-[0_0_24px_rgba(163,230,53,0.12)] backdrop-blur-md">
      <h2 className="font-display text-base text-lime-200">
        Daily on-chain check-in
      </h2>
      <p className="mt-1 text-xs text-zinc-400">
        One check-in per UTC day on Base. You only pay gas. Each check-in
        appends an ERC-8021 data suffix for Base Builder Code attribution (
        <code className="text-zinc-300">ox</code> /{' '}
        <code className="text-zinc-300">Attribution.toDataSuffix</code>
        ).
      </p>
      {!contractAddress ? (
        <p className="mt-3 font-mono text-xs text-amber-300">
          Set{' '}
          <code className="text-amber-200">
            NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS
          </code>{' '}
          after deploying the Foundry contract.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-xl bg-lime-500 px-4 py-2 font-mono text-sm font-bold text-black shadow-[0_0_18px_rgba(163,230,53,0.5)] disabled:opacity-40"
          disabled={disabled}
          onClick={() => void handleCheckIn()}
        >
          {isWriting || isSwitching ? 'Working…' : 'Check in on Base'}
        </button>
        {streak != null ? (
          <span className="font-mono text-sm text-lime-100">
            Streak: {String(streak)}
          </span>
        ) : null}
      </div>
      {writeError ? (
        <p className="mt-2 font-mono text-xs text-red-400">
          {writeError.message}
        </p>
      ) : null}
      {isSuccess ? (
        <p className="mt-2 font-mono text-xs text-lime-300">
          Transaction submitted. Streak updates on confirmation.
        </p>
      ) : null}
    </section>
  );
}
