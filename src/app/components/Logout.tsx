/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useRecoilState, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, modalState, userData, userState } from "../state/PostState";
import { css } from "@emotion/react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";

const LogoutButton = css`
    position : absolute;
    bottom: 20px;
    width : calc(100% - 40px);
    height : 52px;
    background : #fff;
    color : #191919;
    border : 1px solid #ededed;
    border-radius : 4px;
    font-size : 16px;
    font-family : var(--font-pretendard-medium)
    cursor : pointer;
`
const LogInButton = css`
    position : absolute;
    bottom: 20px;
    width : calc(100% - 40px);
    height : 52px;
    background : #0087ff;
    color : #fff;
    border : none;
    border-radius : 4px;
    font-size : 16px;
    font-family : var(--font-pretendard-medium)
    cursor : pointer;
`
export default function Logout() {
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    const [user, setUser] = useRecoilState<userData | null>(userState)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const [modal, setModal] = useRecoilState<boolean>(modalState);
    // State
    const router = useRouter();

    // hook

    const handleLogout = async () => {
        try {
            const confirmed = confirm('로그아웃 하시겠습니까?')
            if (confirmed) {
                await signOut(auth);
                const response = await fetch("/api/utils/logoutDeleteToken", {
                    method: "POST",
                });

                if (response.ok) {
                    setUser(null); // 로그아웃 상태로 초기화
                    setHasLogin(false)
                    router.refresh();
                } else {
                    alert("Failed to logout.");
                }
            }
        } catch (error) {
            console.error("Error during logout:", error);
            alert("An error occurred during logout.");
        }
    }

    const handleLoginToggle = () => {
        setLoginToggle(true);
        setModal(true);
    }

    
    // Function
    return (
        <>
            {(hasLogin) ?
                <div>
                    <button onClick={handleLogout} css={LogoutButton}>로그아웃</button>
                </div>
                :
                <button onClick={handleLoginToggle} css={LogInButton}>로그인</button>
            }
        </>
    )
}