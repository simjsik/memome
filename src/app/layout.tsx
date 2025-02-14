import { ReactNode } from 'react';
import "./globals.css";
import { userData } from './state/PostState';
import loginListener from './hook/LoginHook';
import ProviderClient from './ProviderClients';

type LayoutProps = {
  children: ReactNode;
};

interface loginData {
  user: userData,
  hasLogin: boolean,
  hasGuest: boolean
}

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