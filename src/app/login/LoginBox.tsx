/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use client';
import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { DidYouLogin, hasGuestState, loginToggleState, modalState, signUpState, userData, userState } from "../state/PostState";
import {
    CreateButton,
    GoogleButton,
    GuestButton,
    LoginButton,
    LoginButtonWrap,
    LoginInput,
    LoginInputWrap,
    LoginModalWrap,
    OtherLoginWrap
} from "../styled/LoginComponents";
import { getAuth, GoogleAuthProvider, sendEmailVerification, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, User } from "firebase/auth";
import { LoginOr, LoginSpan, LoginTitle } from "../styled/LoginStyle";
import { usePathname, useRouter } from "next/navigation";
import { saveNewGoogleUser, saveNewGuest, saveNewUser } from "../api/utils/saveUserProfile";
import SignUp from "./SignUp";
import { auth } from "../DB/firebaseConfig";

const LoginWrap = css`
    position : fixed;
    left : 0;
    width : 100%;
    height : 100vh;
    z-index : 5;

    .copyright_box{
        text-align: center;
        margin: 0 auto;

        p:nth-of-type(0){
            font-size: 12px;
            font-family: var(--font-pretendard-light);
        }
        p:nth-of-type(0){
            font-size: 12px;
            font-family: var(--font-pretendard-bold);
            margin-top: 4px;
        }
        span{
            font-size: 14px;
            font-family: var(--font-pretendard-medium);
        }
    }
`
const LoginBg = css`
width : 100%;
height : 100%;
background : rgba(0,0,0,0.8);
`
const LogoBox = css`
    position: absolute;
    left: 50%;
    top: 80px;
    transform: translateX(-50%);
    width: 160px;
    height: 40px;
    background-size: cover;
    background-repeat: no-repeat;
    background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1737169919/%EC%BB%AC%EB%9F%AC%EB%A1%9C%EA%B3%A0_snbplg.svg);
`
export default function LoginBox() {
    const setUser = useSetRecoilState<userData | null>(userState)

    const [loginToggle, setLoginToggle] = useRecoilState<boolean>(loginToggleState)
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    const [isGuest, setIsGuest] = useRecoilState<boolean>(hasGuestState)
    const [signUpToggle, setSignUpToggle] = useRecoilState<boolean>(signUpState);
    const [modal, setModal] = useRecoilState<boolean>(modalState);

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [csrfToken, setCsrfToken] = useState<string | null>(null)
    const [loginError, setLoginError] = useState<string | null>(null);
    const [verifyReSend, setVerifyReSend] = useState<boolean>(false);
    const [unverifedUser, setUnverifiedUser] = useState<User | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    // State
    const auths = getAuth();
    const router = useRouter();
    const path = usePathname();
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
            console.log("CSRF 토큰 발급 성공: ", csrfToken);
        } catch (error) {
            console.error("CSRF 토큰 요청 중 오류:", error);
        }
    };

    useEffect(() => {
        getCsrfToken();
    }, []);


    const firebaseErrorMessages: Record<string, string> = {
        "auth/user-not-found": "해당 계정을 찾을 수 없습니다. 이메일을 확인해주세요.",
        "auth/wrong-password": "비밀번호가 올바르지 않습니다. 다시 시도해주세요.",
        "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
        "auth/invalid-email": "유효하지 않은 이메일 형식입니다.",
        "auth/weak-password": "비밀번호는 최소 6자 이상이어야 합니다.",
        "auth/network-request-failed": "네트워크 오류가 발생했습니다. 연결을 확인해주세요.",
        "auth/too-many-requests": "잠시 후 다시 시도해주세요. 요청이 너무 많습니다.",
        "auth/operation-not-allowed": "이 작업은 현재 허용되지 않습니다. 관리자에게 문의하세요.",
        "auth/invalid-credential": "입력하신 이메일 주소와 비밀번호를 다시 한 번 확인해 주세요.",
        "auth/missing-password": "비밀번호를 입력해주세요.",
        // 추가적인 에러 코드 필요 시 확장 가능
    };

    const handleVerifyReSend = async (user: User) => {
        try {
            setLoginError("인증 메일이 재전송되었습니다. 이메일을 확인해주세요.");
            setVerifyReSend(false);

            await sendEmailVerification(user);
            // 버튼 비활성화 타이머 설정
            setTimeout(() => {
                setVerifyReSend(true);;
            }, 60000); // 60초
        }
        catch (error) {
            setLoginError("인증 메일 전송에 실패했습니다. 다시 시도해주세요.");
        }
    }

    const handleLogin = async (email: string, password: string) => {
        try {
            setVerifyReSend(false);
            const userCredential = await signInWithEmailAndPassword(auths, email, password);
            const user = userCredential.user;


            if (!user.emailVerified) {
                setLoginError('이메일 인증이 필요한 계정입니다.')
                setVerifyReSend(true);
                setUnverifiedUser(user); // 상태에 user 저장
                return;
            }

            if (user) {
                const idToken = await userCredential.user.getIdToken();
                const hasGuest = false;

                if (idToken) {
                    // 서버로 ID 토큰 전송
                    const csrfResponse = await fetch("/api/utils/validateAuthToken", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 쿠키를 요청 및 응답에 포함
                        body: JSON.stringify({ idToken, csrfToken, hasGuest }),
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
                        saveNewUser(user.uid, user.displayName);
                        router.push('/home/main')
                    } else {
                        setLoginError("로그인 요청 실패. 다시 시도해주세요.");
                        getCsrfToken();
                    }
                } else {
                    setLoginError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
                }
            }
        } catch (error: any) {
            console.error("로그인 중 오류 발생:", error);

            // Firebase 에러 코드별 메시지 처리
            if (error.code && firebaseErrorMessages[error.code]) {
                setLoginError(firebaseErrorMessages[error.code]);
            } else {
                setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
            }
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
                const hasGuest = false;

                if (idToken) {
                    // 서버로 ID 토큰 전송
                    const csrfResponse = await fetch("/api/utils/validateAuthToken", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 쿠키를 요청 및 응답에 포함
                        body: JSON.stringify({ idToken, csrfToken, hasGuest }),
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
                        saveNewGoogleUser(user.uid, user.displayName, user.photoURL);
                        router.push('/home/main'); // 메인 페이지로 이동
                    } else {
                        setLoginError("로그인 요청 실패. 다시 시도해주세요.");
                        getCsrfToken();
                    }
                } else {
                    setLoginError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
                }
            }
        } catch (error: any) {
            console.error("로그인 중 오류 발생:", error);

            // Firebase 에러 코드별 메시지 처리
            if (error.code && firebaseErrorMessages[error.code]) {
                setLoginError(firebaseErrorMessages[error.code]);
            } else {
                setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
            }
            return;
        }
    };

    const handleGuestLogin = async () => {
        try {
            const userCredential = await signInAnonymously(auth);
            const user = userCredential.user;

            if (user) {
                const idToken = await userCredential.user.getIdToken();
                const hasGuest = true;
                if (idToken) {
                    // 서버로 ID 토큰 전송
                    const csrfResponse = await fetch("/api/utils/validateAuthToken", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include", // 쿠키를 요청 및 응답에 포함
                        body: JSON.stringify({ idToken, csrfToken, hasGuest }),
                    });

                    if (csrfResponse.ok) {
                        setUser({
                            name: user.displayName,
                            email: user.email,
                            photo: user.photoURL,
                            uid: user.uid,
                        });

                        setHasLogin(true);
                        setIsGuest(true);
                        setLoginToggle(false);
                        saveNewGuest(user.uid);
                        router.push('/home/main')
                    } else {
                        setLoginError("로그인 요청 실패. 다시 시도해주세요.");
                        getCsrfToken();
                    }
                } else {
                    setLoginError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
                }
            }
        } catch (error: any) {
            console.error("로그인 중 오류 발생:", error);

            // Firebase 에러 코드별 메시지 처리
            if (error.code && firebaseErrorMessages[error.code]) {
                setLoginError(firebaseErrorMessages[error.code]);
            } else {
                setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
            }
            return;
        }
    }
    // ESC 키 및 배경 클릭 핸들러
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && modal && loginToggle) {
            setModal(false);
            setLoginToggle(false);
        }
    };

    const handleBackgroundClick = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node) && modal && loginToggle) {
            setModal(false);
            setLoginToggle(false);
        }
    };

    // Mount/Unmount 상태 감지 및 이벤트 등록
    useEffect(() => {
        if (!hasLogin) {
            setModal(true); // 모달이 열릴 때 modal 상태 true로 설정
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleBackgroundClick);
        }

        return () => {
            setModal(false); // 모달이 닫힐 때 modal 상태 false로 설정
            setSignUpToggle(false)
            setEmail('')
            setPassword('')

            setLoginError(null)
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleBackgroundClick);
        };
    }, [hasLogin]);

    // Function
    return (
        <>
            {path !== '/login' ?
                !hasLogin &&
                <div css={LoginWrap}>
                    {!hasLogin &&
                        <>
                            <div css={LoginBg}></div>
                            {!signUpToggle ?
                                <LoginModalWrap>
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
                                        <div className="login_error_wrap">
                                            {
                                                loginError &&
                                                <p className="login_error">{loginError}</p>
                                            }
                                            {
                                                (loginError && verifyReSend) &&
                                                <button
                                                    onClick={() => handleVerifyReSend(unverifedUser as User)}
                                                    disabled={!verifyReSend}
                                                >인증 메일 재전송</button>
                                            }
                                        </div>
                                        <LoginButton type="submit">로그인</LoginButton>
                                    </form>
                                    <LoginSpan>처음 이신가요?</LoginSpan >
                                    <CreateButton onClick={() => setSignUpToggle(true)}>회원가입</CreateButton>

                                    <OtherLoginWrap>
                                        <LoginOr>또는</LoginOr>
                                        <div>
                                            <GoogleButton onClick={handleGoogleLogin}>Google 계정으로 로그인</GoogleButton>
                                            <GuestButton onClick={handleGuestLogin}>게스트 로그인</GuestButton>
                                        </div>
                                    </OtherLoginWrap>
                                </LoginModalWrap>
                                :
                                <SignUp />
                            }
                        </>
                    }
                </div >
                :
                <div css={LoginWrap}>
                    <div className="logo_box" css={LogoBox}></div>
                    {!signUpToggle ?
                        <LoginButtonWrap>
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
                                <div className="login_error_wrap">
                                    {
                                        loginError &&
                                        <p className="login_error">{loginError}</p>
                                    }
                                    {
                                        (loginError && verifyReSend) &&
                                        <button
                                            onClick={() => handleVerifyReSend(unverifedUser as User)}
                                            disabled={!verifyReSend}
                                        >인증 메일 재전송</button>
                                    }
                                </div>
                                <LoginButton type="submit">로그인</LoginButton>
                            </form>
                            <LoginSpan>처음 이신가요?</LoginSpan >
                            <CreateButton onClick={() => setSignUpToggle(true)}>회원가입</CreateButton>

                            <OtherLoginWrap>
                                <LoginOr>또는</LoginOr>
                                <div>
                                    <GoogleButton onClick={handleGoogleLogin}>Google 계정으로 로그인</GoogleButton>
                                    <GuestButton onClick={handleGuestLogin}>게스트 로그인</GuestButton>
                                </div>
                            </OtherLoginWrap>
                        </LoginButtonWrap>
                        :
                        <SignUp />
                    }
                    <div className="copyright_box">
                        <p>본 사이트는 포트폴리오 사이트입니다.</p>
                        <p>로그인 및 회원가입 시 사이트 이용에 필요한 정보 외 사용되지 않습니다.</p>
                        <span>ⓒ 2025. SIM HYEOK BO All rights reserved.</span>
                    </div>
                </div >
            }
        </>
    )
}