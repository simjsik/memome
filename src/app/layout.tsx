import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './ProviderClients';
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  nonce: string;
};

export default async function RootLayout({ children }: LayoutProps) {
  const headerNonce = headers().get('x-csp-nonce') ?? '';
  console.log(headerNonce, '서버 측 난수값')
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