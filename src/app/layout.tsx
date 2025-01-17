import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './components/ProviderComponents/ProviderClients';

type LayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {

  return (
    <html lang="ko">
      <body>
        <ProviderClient>
          {children}
        </ProviderClient>
      </body>
    </html>
  );
}