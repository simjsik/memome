/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { bookMarkState, DidYouLogin, loginToggleState, modalState, postStyleState, UsageLimitState, userData, userState } from "./state/PostState";
import { checkUsageLimit } from "./api/utils/checkUsageLimit";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./DB/firebaseConfig";

interface DefaultMainProps {
    user: userData | null,
    hasLogin: boolean
}

export default function DefaultMain({ user, hasLogin }: DefaultMainProps) {
    const pathName = usePathname();
    const isMain = pathName === '/';
    const isPost = pathName === '/home/post'
    const isLogin = pathName === '/login'
    // 위치

    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const [modal, setModal] = useRecoilState<boolean>(modalState);
    const router = useRouter();
    // State
    useEffect(() => {
        if (!hasLogin) {
            router.push('/login');
            setLoginToggle(true);
        }
    }, [user, hasLogin])


    useEffect(() => {
        const htmlElement = document.documentElement; // <html> 태그 선택
        if (modal) {
            htmlElement.classList.add('modal-active'); // 모달 활성화 시 클래스 추가
        } else {
            htmlElement.classList.remove('modal-active'); // 모달 비활성화 시 클래스 제거
        }
    }, [modal]);

    // 모달 닫기 함수
    const closeModal = () => setModal(false);
    return (
        <></>
    )
}