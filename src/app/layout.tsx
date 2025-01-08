/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { ReactNode, useEffect } from 'react';
import "./globals.css";
import { PretendardBold, PretendardMedium, PretendardLight } from './styled/FontsComponets';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { useParams, usePathname } from 'next/navigation';
import { loginToggleState, postStyleState, UsageLimitState, userData, userState } from './state/PostState';

import LoginBox from './login/LoginBox';
import StatusBox from './components/StatusBox';
import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavWrap from './components/NavWrap';
import { checkUsageLimit } from './api/utils/checkUsageLimit';
import UsageLimit from './components/UsageLimit';

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
  const params = useParams();
  const isMain = pathName === '/';
  const isPost = pathName === '/home/post'
  const isLogin = pathName === '/login'
  // 위치

  const loginToggle = useRecoilValue<boolean>(loginToggleState)
  const [postStyle, setPostStyle] = useRecoilState<boolean>(postStyleState)
  const [currentUser, setCurrentUser] = useRecoilState<userData | null>(userState)
  const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
  // State

  // 사용량 확인
  useEffect(() => {
    if (currentUser) {
      const checkLimit = async () => {
        try {
          await checkUsageLimit(currentUser.uid);
        } catch (err: any) {
          if (err.message.includes('사용량 제한')) {
            setUsageLimit(true);
          } else {
            console.log('사용량을 불러오는 중 에러가 발생했습니다.');
          }
        }
      }
      checkLimit();
    } else {
      console.log('제한 안함')
    }
  }, [currentUser])

  const handlePostStyle = () => {
    setPostStyle((prev) => !prev);
  }

  // Function

  return (
    <>
      {usageLimit && <UsageLimit />}
      {(!isPost && !isLogin) &&
        <>
          <NavWrap></NavWrap>
          <StatusBox></StatusBox>
        </>
      }
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

