import { ReactNode } from 'react';
import "./globals.css";
import loginListener from './hook/LoginHook';
import ProviderClient from './ProviderClients';

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
};

const loginData = await loginListener();

export default async function RootLayout({ children }: LayoutProps) {
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