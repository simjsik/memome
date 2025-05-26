export const dynamic = "force-dynamic";

import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './ProviderClients';
import { headers } from 'next/headers';

type LayoutProps = {
  children: ReactNode;
  nonce: string;
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