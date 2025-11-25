import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './ProviderClients';
import { headers } from 'next/headers';
import { Metadata } from 'next';

type LayoutProps = {
  children: ReactNode;
  nonce: string;
};

export const metadata: Metadata = {
  verification: {
    google: 'fvSAX_fKzSjOdV60yKEwBunm7-Gc4BcJkBzw7ZoaQi0',
  },
  category: 'Technology',
};

export default async function RootLayout({ children }: LayoutProps) {
  const headerNonce = headers().get('x-csp-nonce') ?? '';
  return (
    <html lang="ko">
      <body>
        <ProviderClient nonce={headerNonce}>
          {children}
        </ProviderClient>
      </body>
    </html >
  );
}