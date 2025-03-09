import { ReactNode } from 'react';
import "./globals.css";
import loginListener from './hook/LoginHook';
import ProviderClient from './ProviderClients';
import { userData } from './state/PostState';

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: LayoutProps) {
  const autologin = await loginListener();
  const loginData = { user: autologin.user as userData, hasLogin: autologin.hasLogin as boolean, hasGuest: autologin.hasGuest as boolean }

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