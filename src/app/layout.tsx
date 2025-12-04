import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './ProviderClients';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import Head from 'next/head';

type LayoutProps = {
  children: ReactNode;
  nonce: string;
};

export const metadata: Metadata = {
  verification: {
    google: 'MIrr3EbzhfSVsv0wYXBNUhyOZAzuC4fE7oRFoQ0j678',
  },
  category: 'Technology',
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({ children }: LayoutProps) {
  const headerNonce = headers().get('x-csp-nonce') ?? '';
  return (
    <html lang="ko">
      <Head>
        <link rel="preload" href="/app/global.css" as="style" />
        <link rel="dns-prefetch" href="https://memome-delta.vercel.app" />
        <link rel="preconnect" href="https://memome-delta.vercel.app" crossOrigin="anonymous" />
      </Head>
      <body>
        <ProviderClient nonce={headerNonce}>
          {children}
        </ProviderClient>
      </body>
    </html >
  );
}