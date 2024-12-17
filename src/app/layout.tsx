/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { ReactNode, useEffect } from 'react';
import "./globals.css";
import { PretendardBold, PretendardMedium, PretendardLight } from './styled/FontsComponets';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { usePathname } from 'next/navigation';
import { loginToggleState, postStyleState, userState } from './state/PostState';

import LoginBox from './login/LoginBox';
import NavBar from './components/NavBar';
import StatusBox from './components/StatusBox';
import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { db } from './DB/firebaseConfig';
import NavWrap from './components/NavWrap';

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
  const isPost = pathName === '/home/post';
  const isMain = pathName === '/';
  // 위치

  const loginToggle = useRecoilValue<boolean>(loginToggleState)
  const [postStyle, setPostStyle] = useRecoilState<boolean>(postStyleState)
  const [user, setUser] = useRecoilState<string | null>(userState)
  // State
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser

    if (currentUser) {
      setUser(currentUser.uid)
    } else {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const checkUsageLimit = async () => {


      if (!user) {
        return console.log('인증되지 않은 사용자 입니다.')
      }

      if (user)
        try {
          const response = await fetch('/api/checkLimit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': user,
            }
          });

          if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error);
          }

          console.log('사용량 요청 확인');
        } catch (error) {
          console.error('사용량 확인 중 에러 발생.' + error)
        }
    };

    checkUsageLimit();
  }, [])

  const handlePostStyle = () => {
    setPostStyle((prev) => !prev);
  }
  // Function
  return (
    <>
      <StatusBox />
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

