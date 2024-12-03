"use client";
import { ReactNode } from 'react';
import "./globals.css";
import { PretendardBold, PretendardMedium, PretendardLight } from './styled/FontsComponets';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { usePathname } from 'next/navigation';
import { loginToggleState, postStyleState } from './state/PostState';

import LoginBox from './login/LoginBox';
import NavBar from './components/NavBar';
import StatusBox from './components/StatusBox';
import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Component



type LayoutProps = {
  children: ReactNode;
};

export const PostStyleBtn = styled.button`
position : fixed;
bottom : 40px;
right : 440px;
z-index : 1;
width : 48px;
height : 48px;
background : red;
  `


function LayoutContent({ children }: LayoutProps) {
  const pathName = usePathname();
  const isLogin = pathName === '/login';
  const isPost = pathName === '/post';
  const isMain = pathName === '/';
  // 위치

  const loginToggle = useRecoilValue<boolean>(loginToggleState)
  const [postStyle, setPostStyle] = useRecoilState<boolean>(postStyleState)

  // State

  const handlePostStyle = () => {
    setPostStyle((prev) => !prev);
  }
  // Function
  return (
    <>
      {(!isLogin && !isPost) && <NavBar />}
      {(!isLogin && !isPost) && <StatusBox />}
      {loginToggle && <LoginBox />}
      {isMain && <PostStyleBtn onClick={handlePostStyle} />}
      {children}
    </>
  );
}

const queryClient = new QueryClient();

export default function RootLayout({ children }: LayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <html lang="ko">
          <body className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable}`}>
            <RecoilRoot> {/* RecoilRoot로 감싸기 */}
              <LayoutContent>
                {children}
              </LayoutContent>
            </RecoilRoot>
          </body>
        </html>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

