import { Attribution } from 'ox/erc8021';
import type { Hex } from 'viem';

/** Builder Code (ERC-8021) suffix for check-in transactions. */
export function getCheckInDataSuffix(): Hex | undefined {
  const rawOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (rawOverride?.startsWith('0x')) {
    return rawOverride as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code) return undefined;
  return Attribution.toDataSuffix({ codes: [code] }) as Hex;
}
