import { Attribution } from 'ox/erc8021';
import type { Hex } from 'viem';
import { productionBuilderCode } from '@/lib/site';

/**
 * ERC-8021 calldata suffix for Base Builder Code attribution.
 * @see https://docs.base.org/apps/builder-codes/builder-codes
 * @see PROMPT — use `ox` `Attribution.toDataSuffix({ codes: [bc_…] })`, not hex pasted as `bc_…`.
 */
export function getCheckInDataSuffix(): Hex | undefined {
  const rawOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX?.trim();
  if (rawOverride?.startsWith('0x')) {
    return rawOverride as Hex;
  }

  const fromEnv = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();
  const code = fromEnv || productionBuilderCode;
  if (!code) return undefined;

  return Attribution.toDataSuffix({ codes: [code] }) as Hex;
}
