/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, userState } from "../state/PostState";
import { css } from "@emotion/react";
import loginListener from "../hook/LoginHook";

const LogoutButton = css`
    position : absolute;
    bottom: 20px;
    width : calc(100% - 40px);
    height : 52px;
    background : #4cc9bf;
    color : #fff;
    border : none;
    border-radius : 4px;
    font-size : 16px;
    font-family : var(--font-pretendard-medium)
    cursor : pointer;
`
export default function Logout() {
    const yourLogin = useRecoilValue<boolean>(DidYouLogin)
    const [user, setUser] = useRecoilState<string | null>(userState)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    // State

    loginListener();
    // hook

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (response.ok) {
                setUser(null); // 로그아웃 상태로 초기화
                alert("Logout successful!");
            } else {
                alert("Failed to logout.");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            alert("An error occurred during logout.");
        }
    }

    const handleLoginToggle = () => {
        setLoginToggle(true);
    }
    // Function
    return (
        <>
            {(yourLogin) ?
                <div>
                    <button onClick={handleLogout} css={LogoutButton}>로그아웃</button>
                </div>
                :
                <button onClick={handleLoginToggle} css={LogoutButton}>로그인</button>
            }
        </>
    )
}