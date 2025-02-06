import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './components/ProviderComponents/ProviderClients';
import loginListener from './hook/LoginHook';
import { userData } from './state/PostState';

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