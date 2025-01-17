import { ReactNode } from 'react';
import "./globals.css";
import ProviderClient from './components/ProviderComponents/ProviderClients';
import loginListener from './hook/LoginHook';

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
    </html>
  );
}