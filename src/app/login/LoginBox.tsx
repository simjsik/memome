/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use client';
import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, modalState, signUpState, userData, userState } from "../state/PostState";
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
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { LoginOr, LoginSpan } from "../styled/LoginStyle";
import { usePathname, useRouter } from "next/navigation";
import SignUp from "./SignUp";

interface FirebaseError extends Error {
    code: string;
}

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
    const setUser = useSetRecoilState<userData>(userState)

    const [loginToggle, setLoginToggle] = useRecoilState<boolean>(loginToggleState)
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    const [signUpToggle, setSignUpToggle] = useRecoilState<boolean>(signUpState);
    const [modal, setModal] = useRecoilState<boolean>(modalState);

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState<string | null>(null);
    // const [verifyReSend, setVerifyReSend] = useState<boolean>(false);
    // const [unverifedUser, setUnverifiedUser] = useState<User | null>(null);

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
        } catch (error) {
            console.error("CSRF 토큰 요청 중 오류:", error);
        }
    };

    useEffect(() => {
        getCsrfToken();
    }, []);


    const firebaseErrorMessages: Record<string, string> = {
        "auth/user-not-found": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "auth/wrong-password": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
        "auth/invalid-email": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "auth/weak-password": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "auth/network-request-failed": "네트워크 오류가 발생했습니다. 연결을 확인해주세요.",
        "auth/too-many-requests": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        "auth/operation-not-allowed": "허용되지 않은 요청입니다.",
        "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "auth/missing-password": "비밀번호를 입력해주세요.",
        "auth/invalid-custom-token": "로그인 요청에 실패 했습니다. 다시 시도해주세요",
        // 추가적인 에러 코드 필요 시 확장 가능
    };

    // const handleVerifyReSend = async (user: User) => {
    //     try {
    //         setLoginError("인증 메일이 재전송되었습니다. 이메일을 확인해주세요.");
    //         setVerifyReSend(false);

    //         await sendEmailVerification(user);
    //         // 버튼 비활성화 타이머 설정
    //         setTimeout(() => {
    //             setVerifyReSend(true);;
    //         }, 60000); // 60초
    //     }
    //     catch (error) {
    //         setLoginError("인증 메일 전송에 실패했습니다. 다시 시도해주세요.");
    //     }
    // }

    const isFirebaseError = (error: unknown): error is FirebaseError => {
        return (
            error instanceof Error &&
            'code' in error &&
            typeof (error).code === 'string'
        );
    }
    const handleLogin = async (email: string, password: string) => {
        try {
            setLoginError(null);
            // setVerifyReSend(false);
            const hasGuest = false;

            // 서버로 ID 토큰 전송
            const loginResponse = await fetch("/api/auth/loginApi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, hasGuest }),
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
                if (loginResponse.status === 403) {
                    if (errorData.message = 'CSRF 토큰 인증 실패.') {
                        getCsrfToken();
                    }
                    setLoginError('로그인 시도 실패. 다시 시도 해주세요.')
                    throw new Error(`CSRF 토큰 확인 불가 ${loginResponse.status}: ${errorData.message}`);
                }
                throw new Error(`서버 요청 에러 ${loginResponse.status}: ${errorData.message}`);
            }

            const data = await loginResponse.json();
            const { uid } = data;

            const userResponse = await fetch("/api/utils/sessionFetchData", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid }),
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
                throw new Error(`서버 요청 에러 ${userResponse.status}: ${errorData.message}`);
            }

            const userData = await userResponse.json();
            const { user } = userData;

            setUser(user)
            setHasLogin(true);
            router.push('/home/main');
        } catch (error: unknown) {
            if (isFirebaseError(error)) {
                console.error("로그인 중 오류 발생:", error, error.code);

                // Firebase 에러 코드별 메시지 처리
                if (firebaseErrorMessages[error.code]) {
                    setLoginError(firebaseErrorMessages[error.code]);
                } else if (error.code === "auth/email-not-verified") {
                    // 예시: 이메일 인증 필요 에러 처리
                    setLoginError("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
                } else {
                    setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
                }
            } else {
                // FirebaseError가 아닌 다른 에러인 경우
                console.error("알 수 없는 에러 발생:", error);
                setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
            }
            return;

        }
    }

    const handleGoogleLogin = async () => {
        setLoginError(null);

        try {
            const provider = new GoogleAuthProvider();

            // Google 로그인 팝업
            const result = await signInWithPopup(auths, provider);
            const googleToken = await result.user.getIdToken();
            // 서버 측에서 구글 로그인을 진행시킬 순 없으니 여기서 ID 토큰만 추출 후 전송.
            // result를 전부 보내주면 보안 상 문제가 생김. ( 최소 권한 원칙 )
            if (result) {
                // 서버로 ID 토큰 전송
                const googleResponse = await fetch("/api/auth/googleLoginApi", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // 쿠키를 요청 및 응답에 포함
                    body: JSON.stringify({ googleToken }),
                });

                if (!googleResponse.ok) {
                    const errorData = await googleResponse.json();
                    setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
                    if (googleResponse.status === 403) {
                        if (errorData.message = 'CSRF 토큰 인증 실패.') {
                            getCsrfToken();
                        }
                        setLoginError('로그인 시도 실패. 다시 시도 해주세요.')
                        throw new Error(`CSRF 토큰 확인 불가 ${googleResponse.status}: ${errorData.message}`);
                    }
                    throw new Error(`서버 요청 에러 ${googleResponse.status}: ${errorData.message}`);
                }

                const data = await googleResponse.json();
                const { uid } = data;

                const userResponse = await fetch("/api/utils/sessionFetchData", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid }),
                });

                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
                    throw new Error(`서버 요청 에러 ${userResponse.status}: ${errorData.message}`);
                }

                const userData = await userResponse.json();
                const { user } = userData;

                setUser(user);
                setHasLogin(true);
                router.push('/home/main');
            } else {
                setLoginError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
            }
        } catch (error: unknown) {
            if (isFirebaseError(error)) {
                console.error("로그인 중 오류 발생:", error, error.code);

                // Firebase 에러 코드별 메시지 처리
                if (firebaseErrorMessages[error.code]) {
                    setLoginError(firebaseErrorMessages[error.code]);
                } else if (error.code === "auth/email-not-verified") {
                    // 예시: 이메일 인증 필요 에러 처리
                    setLoginError("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
                } else {
                    setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
                }
            } else {
                // FirebaseError가 아닌 다른 에러인 경우
                console.error("알 수 없는 에러 발생:", error);
                setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
            }
            return;
        }
    };

    const handleGuestLogin = async () => {
        setLoginError(null);
        try {
            const hasGuest = true;
            const guestUid = localStorage.getItem("guestUid");

            const guestResponse = await fetch("/api/auth/guestLoginApi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 쿠키를 요청 및 응답에 포함
                body: JSON.stringify({ hasGuest, guestUid }),
            });

            if (!guestResponse.ok) {
                const errorData = await guestResponse.json();
                console.log(guestResponse.status, '에러 상태')
                if (guestResponse.status === 403) {
                    if (errorData.message === 'CSRF 토큰 인증 실패.') {
                        getCsrfToken();
                        throw new Error(`CSRF 토큰 확인 불가 ${guestResponse.status}: ${errorData.message}`);
                    }
                    setLoginError('로그인 시도 실패. 다시 시도 해주세요.')
                }
                setLoginError('게스트 로그인에 실패했습니다. 다시 시도 해주세요.')
                throw new Error(`서버 요청 에러 ${guestResponse.status}: ${errorData.message}`);
            }

            const data = await guestResponse.json();
            const { uid } = data;

            if (!guestUid || guestUid != uid) {
                localStorage.setItem("guestUid", uid);
            }

            const guestUserResponse = await fetch("/api/utils/sessionFetchData", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid }),
            });

            if (!guestUserResponse.ok) {
                const errorData = await guestUserResponse.json();
                setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
                throw new Error(`서버 요청 에러 ${guestUserResponse.status}: ${errorData.message}`);
            }

            const userData = await guestUserResponse.json();
            const { user } = userData;

            setUser(user)
            setHasLogin(true);
            router.push('/home/main');
        } catch (error: unknown) {
            if (isFirebaseError(error)) {
                console.error("로그인 중 오류 발생:", error, error.code);

                // Firebase 에러 코드별 메시지 처리
                if (firebaseErrorMessages[error.code]) {
                    setLoginError(firebaseErrorMessages[error.code]);
                } else if (error.code === "auth/email-not-verified") {
                    // 예시: 이메일 인증 필요 에러 처리
                    setLoginError("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
                } else {
                    setLoginError("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.");
                }
            } else {
                // FirebaseError가 아닌 다른 에러인 경우
                console.error("알 수 없는 에러 발생:", error);
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
                                            {/* {
                                                (loginError && verifyReSend) &&
                                                <button
                                                    onClick={() => handleVerifyReSend(unverifedUser as User)}
                                                    disabled={!verifyReSend}
                                                >인증 메일 재전송</button>
                                            } */}
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
                                    {/* {
                                        (loginError && verifyReSend) &&
                                        <button
                                            onClick={() => handleVerifyReSend(unverifedUser as User)}
                                            disabled={!verifyReSend}
                                        >인증 메일 재전송</button>
                                    } */}
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