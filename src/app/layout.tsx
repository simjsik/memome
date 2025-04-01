import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './ProviderClients';

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
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