/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use clients';

import { useRecoilValue, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState } from "../state/PostState";
import { css } from "@emotion/react";
import { logoutClearToken } from "../api/LogOutApi";
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
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    // State

    loginListener();
    // hook

    const handleLogout = async () => {
        logoutClearToken();
    }

    const handleLoginToggle = () => {
        setLoginToggle(true);
    }
    // Function
    return (
        <>
            {(yourLogin) ? <button onClick={handleLogout} css={LogoutButton}>로그아웃</button> : <button onClick={handleLoginToggle} css={LogoutButton}>로그인</button>}
        </>
    )
}