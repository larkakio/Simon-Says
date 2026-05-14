import type { Metadata } from 'next';
import { IBM_Plex_Mono, Orbitron } from 'next/font/google';
import { headers } from 'next/headers';
import { cookieToInitialState, type State } from 'wagmi';
import { Providers } from '@/components/providers';
import { config } from '@/lib/wagmi/config';
import {
  productionAppDescription,
  productionBaseAppId,
  productionSiteUrl,
} from '@/lib/site';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? productionSiteUrl;
const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? productionBaseAppId;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Neon Simon — Base',
  description: productionAppDescription,
  openGraph: {
    title: 'Neon Simon — Base',
    description: productionAppDescription,
    url: siteUrl,
    images: [{ url: '/app-thumbnail.jpg', width: 1920, height: 1004 }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get('cookie');
  const initialState: State | undefined = cookieToInitialState(
    config,
    cookieHeader ?? undefined,
  );

  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content={baseAppId} />
        <link rel="icon" href="/app-icon.jpg" />
        <link rel="apple-touch-icon" href="/app-icon.jpg" />
      </head>
      <body
        className={`${orbitron.variable} ${ibmPlexMono.variable} mesh-drift antialiased`}
      >
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
