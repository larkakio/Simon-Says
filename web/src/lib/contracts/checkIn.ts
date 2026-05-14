import type { Abi, Address } from 'viem';

export const checkInAbi = [
  {
    type: 'function',
    name: 'checkIn',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'event',
    name: 'CheckedIn',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'day', type: 'uint256', indexed: true },
      { name: 'streak', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'currentDay',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'lastCheckInDay',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'streakCount',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const satisfies Abi;

export function checkInContractAddress(): Address | undefined {
  const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!raw || raw === '0x0000000000000000000000000000000000000000') {
    return undefined;
  }
  return raw as Address;
}
