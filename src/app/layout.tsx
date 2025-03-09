import { ReactNode } from 'react';
import "./globals.css";
import loginListener from './hook/LoginHook';
import ProviderClient from './ProviderClients';

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: LayoutProps) {
  const loginData = await loginListener();
  return (
    <html lang="ko">
      <body>
        <ProviderClient loginData={loginData}>
          {children}
        </ProviderClient>
      </body>
    </html >
  );
}