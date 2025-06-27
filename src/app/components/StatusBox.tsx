/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from '@emotion/styled';
import Logout from './Logout';
import MemoStatus from './status/MemoStatus';
import { useParams, usePathname, } from 'next/navigation';
import UserProfile from './status/UserProfile';
import SearchComponent from './SearchComponent';
import { useMediaQuery } from "react-responsive";
import { commentModalState, statusState } from '../state/PostState';
import { css, useTheme } from '@emotion/react';
import { useRecoilState } from 'recoil';
import { motion } from "framer-motion";
import { btnVariants } from '../styled/motionVariant';
import { useEffect, useRef, useState } from 'react';
import useOutsideClick from '../hook/OutsideClickHook';
import { ExitButtons } from './status/ExitButton';

const PostListWrap = styled.div<{ $isMemoPage?: boolean }> `
position : fixed;
top: 40px;
right: clamp(80px, calc((100vw - 1200px) * 0.6), 420px);
width : 400px;
height: 80%;
padding : 20px;
border : 1px solid ${({ theme }) => theme.colors.border};
border-radius : 8px;
background : ${({ theme }) => theme.colors.background};

  ${({ $isMemoPage, theme }) =>
        $isMemoPage &&
        `
            position : fixed;
            top: 0;
            right: 0;
            width : 460px;
            height: 100%;
            padding : 20px;
            border : 1px solid ${theme.colors.border};
            border-radius : 8px;
            background : ${theme.colors.background};
        `
    }

    .list_top{
        position: relative;
        display : flex;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        padding: 10px 0px 96px;
    }

.list_toggle {
width : 48px;
height : 48px;
border : none;
background : gray;
border-radius : 4px;
cursor : pointer;
}

  @media (max-width: 480px) {
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
        transform : none;
        width: 100%;
        height: 100%;
        border-radius: 0px;

        .list_top{
            padding: 0px;
        }
  }

  @media (min-width : 481px) and (max-width: 1200px) {
    position: absolute;
    z-index: 10;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  @media (min-width: 1921px) {
    border-left: 2px solid ${({ theme }) => theme.colors.border};
    border-right: 2px solid ${({ theme }) => theme.colors.border};
    width: 500px;
    max-height : 2000px;
    right: clamp(320px, calc(320px + (100vw - 1920px) * 0.4375), 600px);

    ${({ $isMemoPage, theme }) =>
        $isMemoPage &&
        `
        position : fixed;
        top: 0;
        right: 0;
        width : 460px;
        height: 100%;
        padding : 20px;
        border : 1px solid ${theme.colors.border};
        border-radius : 8px;
        background : ${theme.colors.background};
        `
    }
  }

  @media (min-width: 2560px) {
    width: 600px;
    padding : 28px;
    right: clamp(500px, calc(500px + (100vw - 2560px) * 0.3125), 900px);

    ${({ $isMemoPage, theme }) =>
        $isMemoPage &&
        `
        position : fixed;
        top: 0;
        right: 0;
        height: 100%;
        padding : 20px;
        border : 1px solid ${theme.colors.border};
        border-radius : 8px;
        background : ${theme.colors.background};
    `}
  }

  @media (min-width: 3840px) {
    border-left: 3px solid ${({ theme }) => theme.colors.border};
    border-right: 3px solid ${({ theme }) => theme.colors.border};
    width: 680px;
    padding : 32px;
    right: clamp(920px, calc(920px + (100vw - 3840px) * 0.3125), 1320px);

    ${({ $isMemoPage, theme }) =>
        $isMemoPage &&
        `
        position : fixed;
        top: 0;
        right: 0;
        height: 100%;
        padding : 20px;
        border : 1px solid ${theme.colors.border};
        border-radius : 8px;
        background : ${theme.colors.background};
    `}
  }
    
  @media (min-width: 5120px) {
    width: 760px;
    padding : 36px;
    right: clamp(1420px, calc(1420px + (100vw - 5120px) * 0.3125), 100vw);

    ${({ $isMemoPage, theme }) =>
        $isMemoPage &&
        `
        position : fixed;
        top: 0;
        right: 0;
        height: 100%;
        padding : 20px;
        border : 1px solid ${theme.colors.border};
        border-radius : 8px;
        background : ${theme.colors.background};
    `}
  }
`

export default function StatusBox() {
    const path = usePathname();
    const params = useParams<{ postId: string }>();
    const postId = params?.postId || ''
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const [commentOn, setCommentOn] = useRecoilState<boolean>(commentModalState);
    const [mobileStatus, setMobileStatus] = useRecoilState<boolean>(statusState);
    const [isMemoPage, setIsMemoPage] = useState<boolean>(false);
    const theme = useTheme();
    // Function
    const statusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (location.pathname.startsWith(`/home/memo/`)) {
            setIsMemoPage(true);
        } else {
            setIsMemoPage(false);
        }
    }, [path])
    
    // 768 상태 창 핸들러
    const statusHandle = () => {
        setMobileStatus((prev) => !prev);
    }

    // 외부 클릭 시 드롭다운 닫기
    useOutsideClick(statusRef, () => {
        if (mobileStatus) {
            setMobileStatus(false);
        }
    });

    return (
        <>
            {path !== '/home/post' &&
                <>
                    {(isMobile && (commentOn || mobileStatus)) &&
                        <div css={css`position : fixed; left: 0; top: 0; bottom : 0; right : 0; z-index : 10; background:rgba(0,0,0,0.7);`}>
                            {(!commentOn && mobileStatus) &&
                                <PostListWrap ref={statusRef} >
                                    <SearchComponent></SearchComponent>
                                    <UserProfile></UserProfile >
                                    <Logout></Logout>
                                    <motion.button css={
                                        css`position : absolute;
                                            bottom: 20px;
                                            width : calc(100% - 40px);
                                            height : 52px;
                                            background : ${theme.colors.background};
                                            color : ${theme.colors.text};
                                            border : 1px solid ${theme.colors.border};
                                            border-radius : 4px;
                                            font-size : 1rem;
                                            font-family : var(--font-pretendard-medium);
                                            cursor : pointer;`
                                    }
                                        variants={btnVariants(theme)}
                                        whileHover="otherHover"
                                        whileTap="otherClick"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); statusHandle(); }}>취소</motion.button>
                                </PostListWrap>
                            }
                            {(path === `/home/memo/${params?.postId}` && commentOn && !mobileStatus) &&
                                <PostListWrap>
                                    <div className='list_top'>
                                        <MemoStatus post={postId} />
                                    </div>
                                    <ExitButtons
                                        variants={btnVariants(theme)}
                                        whileHover="otherHover"
                                        whileTap="otherClick"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCommentOn(false); }}>닫기</ExitButtons>
                                </PostListWrap>
                            }
                        </div>
                    }
                    {!isMobile &&
                        <>
                            {path !== `/home/memo/${params?.postId}` ?
                                <PostListWrap>
                                    <SearchComponent></SearchComponent>
                                    {
                                        path !== `/home/memo/${params?.postId}` && <UserProfile></UserProfile >
                                    }
                                    <div className='list_top'>
                                        {
                                            path === `/home/memo/${params?.postId}` && <MemoStatus post={postId} />
                                        }
                                    </div>
                                    {path !== `/home/memo/${params?.postId}` && <Logout></Logout>}
                                </PostListWrap>
                                :
                                <PostListWrap $isMemoPage={isMemoPage}>
                                    {
                                        path !== `/home/memo/${params?.postId}` && <UserProfile></UserProfile >
                                    }
                                    <div className='list_top'>
                                        {
                                            path === `/home/memo/${params?.postId}` && <MemoStatus post={postId} />
                                        }
                                    </div>
                                    {path !== `/home/memo/${params?.postId}` && <Logout></Logout>}
                                </PostListWrap>
                            }
                        </>
                    }
                </>
            }
        </>
    )
}