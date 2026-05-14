import { base, mainnet } from 'viem/chains';
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  injected,
} from 'wagmi';
import { baseAccount, walletConnect } from '@/lib/wagmi/connectorsDirect';

const appName = 'Neon Simon';

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  baseAccount({ appName }),
  ...(wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          metadata: {
            name: appName,
            description: 'Simon Says on Base',
            url:
              process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
            icons: [`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/app-icon.jpg`],
          },
          showQrModal: true,
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [base, mainnet],
  connectors,
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
