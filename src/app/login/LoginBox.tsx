/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use clients';
import { useEffect, useState } from "react";

import { css } from "@emotion/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, userData, userState } from "../state/PostState";
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
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";

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
    const [user, setUser] = useRecoilState<userData | null>(userState)
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    // State
    const auths = getAuth();
    const currentUser = auth.currentUser;
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

            const customToken = await response.json();

            if (response.ok) {
                const userCredential = await signInWithCustomToken(auths, customToken);

                const userData = userCredential.user
                const idToken = await userCredential.user.getIdToken();

                if (idToken) {
                    // 서버에 ID 토큰 전달하여 쿠키 저장 요청
                    await fetch("/api/utils/validateAuthToken", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 쿠키를 요청 및 응답에 포함
                        body: JSON.stringify({ idToken }),
                    });
                }

                setUser({
                    name: userData.displayName,
                    email: userData.email,
                    photo: userData.photoURL,
                    uid: userData.uid,
                });

                setHasLogin(true);
                setLoginToggle(false);
                alert("Login successful!");
            } else {
                alert("Login failed. Please check your credentials.");
            }

        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login.");
            return;
        }
    }

    // 토큰 갱신
    const refreshTokenIfExpired = async () => {
        const user = auth.currentUser;

        if (user) {
            try {
                const newToken = await user.getIdToken(true); // 강제 재발급
                console.log("토큰 재발급 완료:", newToken);

                // 서버에 새 토큰 전송
                const response = await fetch("/api/validateAuthToken", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: newToken }),
                });

                if (response.ok) {
                    console.log("서버 검증 성공");
                } else {
                    console.error("서버 검증 실패");
                }
            } catch (error) {
                console.error("토큰 갱신 실패:", error);
            }
        }
    };

    // Function
    return (
        <div css={LoginWrap}>
            <div css={LoginBg} onClick={() => setLoginToggle(false)}></div>
            <LoginButtonWrap css={PopupLoginWrap}>
                <h2 css={loginTitle}>로그인</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password); }}>
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