export const dynamic = "force-dynamic";

import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './ProviderClients';

type LayoutProps = {
  children: ReactNode;
  nonce: string;
};

export default async function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="ko">
      <body>
        <ProviderClient>
          {children}
        </ProviderClient>
      </body>
    </html >
  );
}