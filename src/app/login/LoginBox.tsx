/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use client';
import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, modalState, userData, userState } from "../state/PostState";
import loginListener from "../hook/LoginHook";
import {
    CreateButton,
    GoogleButton,
    GuestButton,
    LoginButton,
    LoginButtonWrap,
    LoginInput,
    LoginInputWrap,
    NaverButton,
    OtherLoginWrap
} from "../styled/LoginComponents";
import { getAuth, GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { LoginOr, LoginSpan, LoginTitle } from "../styled/LoginStyle";
import { useRouter } from "next/navigation";
import { saveNewGoogleUser, saveNewUser } from "../api/utils/saveUserProfile";
import SignUp from "./SignUp";

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

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void | null;
}
export default function LoginBox({ isOpen, onClose }: ModalProps) {
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useRecoilState<userData | null>(userState)
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    const [csrfToken, setCsrfToken] = useState<string | null>(null)
    const [signUpToggle, setSignUpToggle] = useState<boolean>(false)
    const modalRef = useRef<HTMLDivElement>(null);
    const [modal, setModal] = useRecoilState<boolean>(modalState);
    const [loginError, setLoginError] = useState<string | Error | null>(null);
    // State
    const auths = getAuth();
    const router = useRouter();
    loginListener();
    // hook
    const getCsrfToken = async () => {
        try {
            const csrfResponse = await fetch("/api/auth/validateCsrfToken", {
                method: "GET",
                credentials: "include",
            });

            if (!csrfResponse.ok) {
                console.error("CSRF 토큰 발급 실패:", await csrfResponse.text());
                throw new Error("CSRF 토큰 발급 실패");
            }
            const { csrfToken } = await csrfResponse.json();
            setCsrfToken(csrfToken);

            // 쿠키 설정 후 약간의 지연을 추가
            await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms
            console.log("CSRF 토큰 발급 성공:", csrfToken);
        } catch (error) {
            console.error("CSRF 토큰 요청 중 오류:", error);
        }
    };

    useEffect(() => {
        getCsrfToken();
    }, []);

    const handleGuest = () => {
        setLoginToggle(false);
    }

    const handleLogin = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auths, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setLoginError('이메일 인증이 필요한 계정입니다.')
                await sendEmailVerification(user); // 이메일 인증 메일 재전송
                return;
            }

            if (user) {
                const idToken = await userCredential.user.getIdToken();

                if (idToken) {
                    // 서버로 ID 토큰 전송
                    const csrfResponse = await fetch("/api/utils/validateAuthToken", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 쿠키를 요청 및 응답에 포함
                        body: JSON.stringify({ idToken, csrfToken }),
                    });

                    if (csrfResponse.ok) {
                        setUser({
                            name: user.displayName,
                            email: user.email,
                            photo: user.photoURL,
                            uid: user.uid,
                        });

                        setHasLogin(true);
                        setLoginToggle(false);
                        saveNewUser(user.uid);
                        alert("Login successful!");
                        router.push('/home/main')
                    } else {
                        alert("CSRF Token validation failed. Please try again.");
                        getCsrfToken();
                    }
                } else {
                    alert("Login failed. Please check your credentials.");
                }
            }
        } catch (error) {
            console.error("Error during login:", error);
            setLoginError(error);
            return;
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();

            // Google 로그인 팝업
            const result = await signInWithPopup(auths, provider);
            const user = result.user;

            if (user) {
                // ID 토큰 가져오기
                const idToken = await user.getIdToken();

                // 서버에 ID 토큰 전달하여 쿠키 저장 요청
                const csrfResponse = await fetch("/api/utils/validateAuthToken", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // 쿠키를 요청 및 응답에 포함
                    body: JSON.stringify({ idToken, csrfToken }),
                });

                if (!csrfResponse.ok) {
                    alert("CSRF Token validation failed. Please try again.");
                }

                // 사용자 데이터 설정
                setUser({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    uid: user.uid,
                });

                setHasLogin(true);
                setLoginToggle(false);
                saveNewGoogleUser(user.uid, user.displayName, user.photoURL);
                alert("Google Login successful!");
                router.push('/home/main'); // 메인 페이지로 이동
            }
        } catch (error) {
            console.error("Error during Google login:", error);
            alert("Google login failed. Please try again.");
        }
    };

    // ESC 키 및 배경 클릭 핸들러
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
            onClose();
        }
    };

    const handleBackgroundClick = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node) && onClose) {
            onClose();
        }
    };

    // Mount/Unmount 상태 감지 및 이벤트 등록
    useEffect(() => {
        if (isOpen) {
            setModal(true); // 모달이 열릴 때 modal 상태 true로 설정
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleBackgroundClick);
        }

        return () => {
            setModal(false); // 모달이 닫힐 때 modal 상태 false로 설정
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleBackgroundClick);
        };
    }, [isOpen]);

    // 모달이 열리지 않았을 경우 null 반환
    if (!isOpen) return null;
    // Function
    return (
        <div css={LoginWrap}>
            <div css={LoginBg}></div>
            {!signUpToggle ?
                <LoginButtonWrap ref={modalRef}>
                    <LoginTitle>로그인</LoginTitle>
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
                        {
                            loginError &&
                            <div>
                                <p>{loginError}</p>
                            </div>
                        }
                        <LoginButton type="submit">로그인</LoginButton>
                    </form>
                    <LoginSpan>처음 이신가요?</LoginSpan >
                    <CreateButton onClick={() => setSignUpToggle(true)}>회원가입</CreateButton>

                    <OtherLoginWrap>
                        <LoginOr>또는</LoginOr>
                        <div>
                            <GoogleButton onClick={handleGoogleLogin}>Google 계정으로 로그인</GoogleButton>
                            <GuestButton onClick={handleGuest}>게스트 로그인</GuestButton>
                        </div>
                    </OtherLoginWrap>
                </LoginButtonWrap>
                :
                <SignUp />
            }
        </div >
    )
}