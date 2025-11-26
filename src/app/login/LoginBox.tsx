/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { useEffect, useState } from "react";
import { css, useTheme } from "@emotion/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { browserLocalPersistence, browserSessionPersistence, getAuth, GoogleAuthProvider, setPersistence, signInAnonymously, signInWithCustomToken, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { LoginOr, LoginSpan } from "../styled/LoginStyle";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../DB/firebaseConfig";
import { BeatLoader } from "react-spinners";
import { motion } from "framer-motion";
import Link from "next/link";
import { fetchCustomToken, fetchGuestLogin } from "./utils/authHelper";
import Image from "next/image";
import { withTimeout } from "./utils/timeoutWrapper";
import { autoLoginState, DidYouLogin, userData, userState } from "../state/PostState";
import { CreateButton, GoogleButton, GuestButton, LoginButton, LoginButtonWrap, LoginInput, LoginInputWrap, OtherLoginWrap } from "../styled/LoginComponents";
import { btnVariants } from "../styled/motionVariant";
import useAuthSync from "../hook/AuthSyncHook";

interface FirebaseError extends Error {
    code: string;
}

export const LoginWrap = css`
    position : fixed;
    left : 0;
    width : 100%;
    height : 100vh;
    z-index : 5;

    .copyright_box{
        text-align: center;
        margin: 0 auto;

        p:nth-of-type(1){
            font-size: 0.75rem;
            font-family: var(--font-pretendard-light);
        }
        p:nth-of-type(2){
            font-size: 0.75rem;
            font-family: var(--font-pretendard-bold);
            margin-top: 4px;
        }
        span{
            font-size: 0.875rem;
            font-family: var(--font-pretendard-medium);
        }
    }

    @media (max-width: 480px) {

    }
`

export const LogoBox = css`
    position: absolute;
    left: 50%;
    top: 50px;
    transform: translateX(-50%);
    width: 160px;
    height: 40px;
    background-size: cover;
    background-repeat: no-repeat;
`
export default function LoginBox() {
    const theme = useTheme();
    const setUser = useSetRecoilState<userData>(userState)
    const setHasLogin = useSetRecoilState<boolean>(DidYouLogin)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingTag, setLoadingTag] = useState<string | null>(null);
    const [hasAutoLogin, setHasAutoLogin] = useRecoilState<boolean>(autoLoginState);

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState<string | null>(null);

    // State
    const auths = getAuth();
    const authSync = useAuthSync();

    const router = useRouter();
    const pathName = usePathname();
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
        "auth/invalid-custom-token": "로그인 요청에 실패 했습니다. 다시 시도해주세요.",
        "auth/popup-closed-by-user": "로그인 요청에 실패 했습니다. 다시 시도해주세요.",
        "auth/email-not-verified": "인증이 필요한 이메일입니다. 이메일을 확인해주세요.",
        // 추가적인 에러 코드 필요 시 확장 가능
    };

    const isFirebaseError = (error: unknown): error is FirebaseError => {
        return (
            error instanceof Error &&
            'code' in error &&
            typeof (error).code === 'string'
        );
    }

    const handleLogin = async (email: string, password: string) => {
        if (isLoading) return;
        setLoginError(null);

        try {
            setIsLoading(true);
            setLoadingTag('Login');

            const { user: signUser } = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await signUser.getIdToken();

            if (!signUser.emailVerified) {
                setLoginError('인증되지 않은 계정입니다. 이메일을 확인해주세요.');
                await signOut(auth);
                return;
            }

            const loginResponse = await fetch(`/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                credentials: "include",
                body: JSON.stringify({ idToken }),
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                throw new Error(`로그인 시도 실패 ${loginResponse.status}: ${errorData.message}`);
            }

            const { userData: data } = await loginResponse.json();
            localStorage.setItem('authInProgress', JSON.stringify({ ts: Date.now(), uid: data.userId }));

            setUser({
                name: data.displayName,
                email: data.email,
                photo: data.photoURL,
                uid: data.userId,
            });
            setHasLogin(true);
            await router.push('/home/main');
        } catch (error: unknown) {
            if (isFirebaseError(error)) {
                console.error("Firebase 오류:", error.code, error.message);
                setLoginError(firebaseErrorMessages[error.code] ?? "Firebase 오류 발생");
            } else if (error instanceof Error) {
                console.error("일반 오류:", error);
                setLoginError(error.message);
            } else {
                console.error("알 수 없는 오류 유형:", error);
                setLoginError("알 수 없는 오류");
            }
            setIsLoading(false);
            await signOut(auth);
        }
    }

    const handleGoogleLogin = async () => {
        if (isLoading) return;
        setLoginError(null);

        try {
            sessionStorage.setItem('authInProgress', JSON.stringify({ ts: Date.now() }))

            setIsLoading(true);
            setLoadingTag('Google');

            // Google 로그인 팝업
            const provider = new GoogleAuthProvider();
            const { user: popupUser } = await signInWithPopup(auths, provider);
            const googleToken = await popupUser.getIdToken();
            // userCredential를 전부 보내주면 보안 상 문제가 생김. ( 최소 권한 원칙 )

            const googleResponse = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                credentials: "include",
                body: JSON.stringify({ idToken: googleToken }),
            });

            if (!googleResponse.ok) {
                const errorData = await googleResponse.json();
                setLoginError('로그인 시도 실패. 다시 시도 해주세요.')
                throw new Error(`로그인 시도 실패 ${googleResponse.status}: ${errorData.message}`);
            }

            const { userData: data } = await googleResponse.json();
            localStorage.setItem('authInProgress', JSON.stringify({ ts: Date.now(), uid: data.userId }))

            setUser({
                name: data.displayName,
                email: data.email,
                photo: data.photoURL,
                uid: data.userId,
            });

            setHasLogin(true);
            await router.push('/home/main');
        } catch (error: unknown) {
            // Firebase 에러 타입 보존
            if (isFirebaseError(error)) {
                console.error("Firebase 오류:", error.code, error.message);
                setLoginError(firebaseErrorMessages[error.code] ?? "Firebase 오류 발생");
            } else if (error instanceof Error) {
                console.error("일반 오류:", error);
                setLoginError(error.message);
            } else {
                console.error("알 수 없는 오류 유형:", error);
                setLoginError("알 수 없는 오류");
            }
            setIsLoading(false);
            await signOut(auth);
        } finally {
            sessionStorage.removeItem('authInProgress');
        }
    };

    const handleGuestLogin = async () => {
        if (isLoading) return;
        setLoginError(null);
        try {
            setIsLoading(true);
            setLoadingTag('Guest');

            let guestUid = localStorage.getItem("guestUid");
            let idToken;
            let data;

            if (guestUid === 'undefined') {
                localStorage.removeItem('guestUid');
                guestUid = null;
            }

            if (guestUid) {
                localStorage.setItem('authInProgress', JSON.stringify({ ts: Date.now(), uid: guestUid }))

                const token = await fetchCustomToken(guestUid);

                const { user: signUser } = await signInWithCustomToken(auth, token);

                idToken = await withTimeout(signUser.getIdToken(), 8000);

                if (!idToken) {
                    throw new Error('유저 정보 초기화. 다시 시도해주세요.');
                }

                data = await withTimeout(fetchGuestLogin(idToken, false), 8000);
            } else {
                const { user: anonUser } = await signInAnonymously(auth);
                const customToken = await withTimeout(fetchCustomToken(anonUser.uid), 8000);

                const { user: guestUser } = await signInWithCustomToken(auth, customToken);

                idToken = await withTimeout(guestUser.getIdToken(), 8000);

                data = await withTimeout(fetchGuestLogin(idToken, true), 8000);

                // Firebase Authentication의 프로필 업데이트
                await updateProfile(guestUser, {
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                });
            }
            localStorage.setItem('guestUid', data.userId);
            localStorage.setItem('authInProgress', JSON.stringify({ ts: Date.now(), uid: data.userId }))

            setUser({
                name: data.displayName,
                email: data.email,
                photo: data.photoURL,
                uid: data.userId,
            });

            setHasLogin(true);
            router.replace('/home/main');
            return;
        } catch (error: unknown) {
            // Firebase 에러 타입 보존
            if (isFirebaseError(error)) {
                console.error("Firebase 오류:", error.code, error.message);
                setLoginError(firebaseErrorMessages[error.code] ?? "게스트 로그인 시도 실패");
            } else if (error instanceof Error) {
                console.error("일반 오류:", error);
                setLoginError(error.message);
            }
            setIsLoading(false);
            await signOut(auth);
        }
    }

    const handleAutoLoginToggle = (checked: boolean) => {
        // 1) 상태 저장
        setHasAutoLogin(checked);
        localStorage.setItem("hasAutoLogin", String(checked));

        // 2) persistence 재설정
        setPersistence(
            auth,
            checked ? browserLocalPersistence : browserSessionPersistence
        ).catch(err => console.error("Persistence 재설정 실패:", err));
    };

    useEffect(() => {
        const sync = async () => {
            const hasAutoLogin = localStorage.getItem("hasAutoLogin") === "true";

            if (hasAutoLogin) {
                await authSync();
            }

            setHasAutoLogin(hasAutoLogin);
        }

        sync();
    }, []);

    // Function
    const GoogleLoginBtn = motion(GoogleButton);
    const GuestLoginBtn = motion(GuestButton);

    return (
        <>
            {pathName === '/login' &&
                <div css={LoginWrap}>
                    <header className="logo_box" css={LogoBox}>
                        <Image
                            src="https://res.cloudinary.com/dsi4qpkoa/image/upload/v1737169919/%EC%BB%AC%EB%9F%AC%EB%A1%9C%EA%B3%A0_snbplg.svg"
                            alt="logo"
                            fill
                            priority  // 첫 화면 LCP에 중요하면 추가
                            style={{ objectFit: 'cover' }}
                        />
                    </header>
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
                            </div>
                            {(loadingTag === 'Login' && isLoading) ?
                                <LoginButton><BeatLoader color={'#fff'} size={8} /></LoginButton> :
                                <LoginButton
                                    variants={btnVariants(theme)}
                                    whileHover="loginHover"
                                    whileTap="loginClick"
                                    type="submit">로그인</LoginButton>
                            }
                        </form>
                        <div className="login_option_wrap">
                            <div className="auto_login_btn">
                                {
                                    hasAutoLogin ?
                                        <button className="auto_on" onClick={() => handleAutoLoginToggle(false)} aria-label="자동 로그인 끄기">
                                            <div className="auto_on_icon">
                                                <Image
                                                    src={'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746267045/%EC%9E%90%EB%8F%99%EB%A1%9C%EA%B7%B8%EC%9D%B8%EC%B2%B4%ED%81%AC_gaqgly.svg'}
                                                    alt="자동 로그인"
                                                    fill
                                                    priority  // 첫 화면 LCP에 중요하면 추가
                                                    style={{ objectFit: 'cover' }}
                                                >
                                                </Image>
                                            </div>
                                        </button>
                                        :
                                        <button className="auto_off" onClick={() => handleAutoLoginToggle(true)} aria-label="자동 로그인 켜기"></button>
                                }
                                <p>자동 로그인</p>
                            </div>
                            <div className="register_wrap">
                                <LoginSpan>처음 이신가요?</LoginSpan >
                                <Link href={'/login/signup'} legacyBehavior>
                                    <CreateButton>회원가입</CreateButton>
                                </Link>
                            </div>
                        </div>
                        <OtherLoginWrap>
                            <LoginOr>또는</LoginOr>
                            <div>
                                {(loadingTag === 'Google' && isLoading) ? <GoogleLoginBtn><BeatLoader color={theme.colors.text} size={8} /></GoogleLoginBtn> : <GoogleLoginBtn
                                    variants={btnVariants(theme)}
                                    whileHover="otherHover"
                                    whileTap="otherClick" onClick={handleGoogleLogin}>Google 계정으로 로그인</GoogleLoginBtn>}
                                {(loadingTag === 'Guest' && isLoading) ? <GuestLoginBtn><BeatLoader color={theme.colors.text} size={8} /></GuestLoginBtn> : <GuestLoginBtn
                                    variants={btnVariants(theme)}
                                    whileHover="otherHover"
                                    whileTap="otherClick" onClick={handleGuestLogin}>게스트 로그인</GuestLoginBtn>}
                                <GuestLoginBtn
                                    variants={btnVariants(theme)}
                                    whileHover="otherHover"
                                    whileTap="otherClick" onClick={() => router.push('home/main')}>둘러보기</GuestLoginBtn>
                            </div>
                        </OtherLoginWrap>
                    </LoginButtonWrap >
                    <footer className="copyright_box">
                        <p>본 사이트는 포트폴리오 사이트입니다.</p>
                        <p>로그인 및 회원가입 시 사이트 이용에 필요한 정보 외 사용되지 않습니다.</p>
                        <span>ⓒ 2025. SIM HYEOK BO All rights reserved.</span>
                    </footer>
                </div >
            }
        </>
    )
}