/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useRecoilState, useSetRecoilState } from "recoil";
import { bookMarkState, DidYouLogin, PostData, UsageLimitToggle, userBookMarkState, userData, userState } from "../state/PostState";
import { css } from "@emotion/react";
import { signOut } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";
import { motion } from "framer-motion";
import { btnVariants } from "../styled/motionVariant";
import { useRouter } from "next/navigation";

const LogoutButton = css`
    position : absolute;
    bottom: 20px;
    width : calc(100% - 40px);
    height : 52px;
    background : #fff;
    color :rgb(255, 30, 0);
    border : 1px solid #ededed;
    border-radius : 4px;
    font-size : 1rem;
    font-family : var(--font-pretendard-medium);
    cursor : pointer;

    @media (max-width: 1200px) {
        bottom: 80px;
    }

    @media (min-width: 2560px) {
        bottom: 28px;
        width : calc(100% - 56px);
        height : 68px;
    }

    @media (min-width: 3840px) {
        bottom: 32px;
        width : calc(100% - 64px);
        height : 84px;
    }
        
    @media (min-width: 5120px) {
        bottom: 36px;
        width : calc(100% - 72px);
        height : 96px;
        font-size : 0.875rem
    }
`
// const LogInButton = css`
//     position : absolute;
//     bottom: 20px;
//     width : calc(100% - 40px);
//     height : 52px;
//     background : #0087ff;
//     color : #fff;
//     border : none;
//     border-radius : 4px;
//     font-size : 16px;
//     font-family : var(--font-pretendard-medium)
//     cursor : pointer;
// `
export default function Logout() {
    const setHasLogin = useSetRecoilState<boolean>(DidYouLogin)
    const [user, setUser] = useRecoilState<userData>(userState)
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState)
    const setUserCurrentBookmark = useSetRecoilState<PostData[]>(userBookMarkState)
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    // State
    const router = useRouter();
    // hook

    const handleLogout = async () => {
        try {
            const confirmed = confirm('로그아웃 하시겠습니까?')
            if (confirmed && user) {
                const response = await fetch(`/api/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('로그아웃 실패 :', errorData.message)
                }

                await signOut(auth);

                setUser({
                    name: null,
                    email: null,
                    photo: null,
                    uid: null, // uid는 빈 문자열로 초기화
                }); // 로그아웃 상태로 초기화
                setCurrentBookmark([])
                setUserCurrentBookmark([])
                setHasLogin(false)
                setLimitToggle(false)

                router.push('/login');
            }
        } catch (error) {
            console.error("로그아웃 에러:", error);
            alert("로그아웃 시도 중 에러가 발생했습니다..");
        }
    }

    // Function
    return (
        <>
            <motion.button
                variants={btnVariants}
                whileHover="otherHover"
                whileTap="otherClick"
                onClick={handleLogout} css={LogoutButton}>
                로그아웃
            </motion.button >
        </>
    )
}