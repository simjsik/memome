import { ReactNode } from 'react';
import "./globals.css";
import loginListener from './hook/LoginHook';
import ProviderClient from './ProviderClients';

type LayoutProps = {
  children: ReactNode;
};

const loginData = await loginListener();
console.log(loginData, '레이아웃 유저 정보 전달')
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