/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecoilValue, } from "recoil";
import { modalState } from "./state/PostState";



export default function DefaultMain() {

    const modal = useRecoilValue<boolean>(modalState);
    const router = useRouter();
    // State

    useEffect(() => {

        router.push('/home/main');
    }, [])

    useEffect(() => {
        const htmlElement = document.documentElement; // <html> 태그 선택
        if (modal) {
            htmlElement.classList.add('modal-active'); // 모달 활성화 시 클래스 추가
        } else {
            htmlElement.classList.remove('modal-active'); // 모달 비활성화 시 클래스 제거
        }
    }, [modal]);

    return (
        <></>
    )
}