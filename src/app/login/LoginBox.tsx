/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use clients';
import { useState } from "react";

import { css } from "@emotion/react";
import { } from "../DB/firebaseConfig";
import { useRecoilState, useSetRecoilState } from "recoil";
import { loginToggleState, userState } from "../state/PostState";
import loginListener from "../hook/LoginHook";
import {
    CreateButton,
    GoogleButton,
    GuestButton,
    LoginButtonWrap,
    LoginInput,
    LoginInputWrap,
    NaverButton,
    OtherLoginWrap
} from "../styled/LoginComponents";

const LoginWrap = css`
position : fixed;
left : 0;
width : 100%;
height : 100vh;
z-index : 5;
`

const LoginBg = css`
width : 100%;
height : 100%;
background : rgba(0,0,0,0.8);
`

const PopupLoginWrap = css`
left : 50%;
right : auto;
transform: translate(-50%, -50%);
`

const loginTitle = css`
  font-size : 24px;
  font-family : var(--font-pretendard-bold);
  font-weight: 700;
`;

const loginOr = css`
  font-size : 14px;
  color : #c7c7c7;
  font-family : var(--font-pretendard-light);
  font-weight: 500;
  text-align : center;
`;

const LoginButton = css`
width: 100%;
height : 52px;
margin-top : 20px;
border : none;
border-radius : 4px;
background : #4cc9bf;
color: #fff;
font-size : 16px;
font-family : var(--font-pretendard-medium);
`
export default function LoginBox() {

    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useRecoilState<string | null>(userState)
    const [error, setError] = useState<string>('')
    // State

    loginListener();
    // hook

    const handleGuest = () => {
        setLoginToggle(false);
    }

    const handleLogin = async (email: string, password: string) => {
        try {
            const response = await fetch("/api/auth/loginApi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data); // 로그인 상태 업데이트
                alert("Login successful!");
            } else {
                alert("Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login.");
        }
    }


    // Function
    return (
        <div css={LoginWrap}>
            <div css={LoginBg} onClick={() => setLoginToggle(false)}></div>
            <LoginButtonWrap css={PopupLoginWrap}>
                <h2 css={loginTitle}>로그인</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password);}}>
                    <LoginInputWrap>
                        <div>
                            <p>이메일 또는 아이디</p>
                            <LoginInput type="email" placeholder='' value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <p>패스워드</p>
                            <LoginInput type="password" placeholder='' value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </LoginInputWrap>
                    <span css={css`
              font-size : 14px;
              margin-right : 4px;
              font-family : var(--font-pretendard-medium);
              font-weight: 500;
               `}>처음 이신가요?</span>
                    <CreateButton>회원가입</CreateButton>
                    <button type="submit" css={LoginButton}>로그인</button>
                </form>
                <OtherLoginWrap>
                    <h2 css={loginOr}>또는</h2>
                    <div>
                        <GoogleButton>Google 계정으로 로그인</GoogleButton>
                        <NaverButton>네이버 계정으로 로그인</NaverButton>
                        <GuestButton onClick={handleGuest}>게스트 로그인</GuestButton>
                    </div>
                </OtherLoginWrap>
            </LoginButtonWrap>
        </div >
    )
}