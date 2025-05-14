/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, modalState, userData, userState } from "../state/PostState";
import {
    CreateButton,
    GoogleButton,
    GuestButton,
    LoginButton,
    LoginButtonWrap,
    LoginInput,
    LoginInputWrap,
    OtherLoginWrap
} from "../styled/LoginComponents";
import { browserLocalPersistence, browserSessionPersistence, getAuth, GoogleAuthProvider, setPersistence, signInAnonymously, signInWithCustomToken, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { LoginOr, LoginSpan } from "../styled/LoginStyle";
import { usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../DB/firebaseConfig";
import { BeatLoader } from "react-spinners";
import { motion } from "framer-motion";
import Link from "next/link";
import { btnVariants } from "../styled/motionVariant";

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
            font-size: 12px;
            font-family: var(--font-pretendard-light);
        }
        p:nth-of-type(2){
            font-size: 12px;
            font-family: var(--font-pretendard-bold);
            margin-top: 4px;
        }
        span{
            font-size: 14px;
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
    background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1737169919/%EC%BB%AC%EB%9F%AC%EB%A1%9C%EA%B3%A0_snbplg.svg);
`
export default function LoginBox() {
    const setUser = useSetRecoilState<userData>(userState)

    const [loginToggle, setLoginToggle] = useRecoilState<boolean>(loginToggleState)
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    const [modal, setModal] = useRecoilState<boolean>(modalState);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingTag, setLoadingTag] = useState<string | null>(null);
    const [hasAutoLogin, setHasAutoLogin] = useState<boolean>(false);

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    // State
    const auths = getAuth();
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

            await setPersistence(auth, hasAutoLogin ? browserLocalPersistence : browserSessionPersistence);
            localStorage.setItem('hasAutoLogin', `${hasAutoLogin}`);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const signUser = userCredential.user
            const idToken = await signUser.getIdToken();

            const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
            const role = ADMIN_EMAILS.includes(userCredential.user.email ?? '') ? 3 : 2;

            if (!signUser.emailVerified) {
                return setLoginError('인증되지 않은 계정입니다. 이메일을 확인해주세요.');
            }
            // 서버로 ID 토큰 전송
            const loginResponse = await fetch(`/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                credentials: "include",
                body: JSON.stringify({ idToken, role, hasGuest: false }),
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
                if (loginResponse.status === 403) {
                    setLoginError('로그인 시도 실패. 다시 시도 해주세요.')
                    throw new Error(`CSRF 토큰 확인 불가 ${loginResponse.status}: ${errorData.message}`);
                }
                throw new Error(`서버 요청 에러 ${loginResponse.status}: ${errorData.message}`);
            }

            const data = await loginResponse.json();
            const { uid, user } = data;

            setUser({
                name: user.name,
                email: user.email,
                photo: user.photo,
                uid: uid,
            })
            setHasLogin(true);
            await router.push('/home/main');
        } catch (error: unknown) {
            // Firebase 에러 타입 보존
            if (isFirebaseError(error)) {
                if (isFirebaseError(error)) {
                    console.error("Firebase 오류:", error.code, error.message);
                    setLoginError(firebaseErrorMessages[error.code] ?? "Firebase 오류 발생");
                } else if (error) {
                    console.error("일반 오류:", error);
                    setLoginError(error);
                } else {
                    console.error("알 수 없는 오류 유형:", error);
                    setLoginError("알 수 없는 오류");
                }
            }
        } finally {
            setIsLoading(false); // 무조건 실행
            setLoadingTag(null);
        }
    }

    const handleGoogleLogin = async () => {
        if (isLoading) return;
        setLoginError(null);

        try {
            setIsLoading(true);
            setLoadingTag('Google');

            // Google 로그인 팝업
            await setPersistence(auth, hasAutoLogin ? browserLocalPersistence : browserSessionPersistence);
            localStorage.setItem('hasAutoLogin', `${hasAutoLogin}`);
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auths, provider);
            const googleToken = await userCredential.user.getIdToken();
            // userCredential를 전부 보내주면 보안 상 문제가 생김. ( 최소 권한 원칙 )

            // 역할 동적 할당 (환경 변수 기반)
            const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
            const role = ADMIN_EMAILS.includes(userCredential.user.email ?? '') ? 3 : 2;

            // 서버로 ID 토큰 전송
            const googleResponse = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                credentials: "include",
                body: JSON.stringify({ idToken: googleToken, role, hasGuest: false }),
            });

            if (!googleResponse.ok) {
                const errorMsg = googleResponse.status === 403
                    ? '로그인 시도 실패. 다시 시도 해주세요.'
                    : '구글 로그인에 실패했습니다.';
                throw new Error(errorMsg);
            }

            const data = await googleResponse.json();
            const { uid, user } = data;

            setUser({
                name: user.name,
                email: user.email,
                photo: user.photo,
                uid: uid,
            })
            setHasLogin(true);
            await router.push('/home/main');
        } catch (error: unknown) {
            if (isFirebaseError(error)) {
                console.error("Firebase 오류 발생:", error.code, error.message);
                setLoginError(firebaseErrorMessages[error.code] ?? "알 수 없는 오류가 발생했습니다.");
                // Firebase 에러 코드별 메시지 처리
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    setLoginError(error.message);
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    setLoginError("알 수 없는 오류가 발생했습니다.");
                }
            }
        } finally {
            setIsLoading(false); // 무조건 실행
            setLoadingTag(null);
        }
    };

    const handleGuestLogin = async () => {
        if (isLoading) return;
        setLoginError(null);

        try {
            setIsLoading(true);
            setLoadingTag('Guest');

            await setPersistence(auth, hasAutoLogin ? browserLocalPersistence : browserSessionPersistence);
            localStorage.setItem('hasAutoLogin', `${hasAutoLogin}`);
            let guestUid = localStorage.getItem("guestUid");
            let idToken;
            let signUser;
            let data;
            let guestResponse;
            let customTokenResponse;
            console.log(guestUid, '게스트 UID')

            // 공통 게스트 로그인 로직
            const handleGuestResponse = async (idToken: string, guestUid?: string) => {
                return await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: "include",
                    body: JSON.stringify({ idToken, role: 1, hasGuest: true, guestUid }),
                });
            };
            const handleCustomTokenResponse = async (guestUid?: string) => {
                return await fetch("/api/customToken", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ guestUid }),
                });
            };

            if (guestUid) {
                console.log('게스트 로그인 이력 유 : 로직 실행')

                const guestDocRef = doc(db, 'guests', guestUid);
                const guestsDoc = await getDoc(guestDocRef);
                if (!guestsDoc.exists()) { // 🔥 존재하지 않는 UID 차단
                    await auth.signOut(); // 🔥 세션 무효화
                    localStorage.removeItem("guestUid"); // 🔥 잘못된 UID 삭제
                    return setLoginError('게스트 로그인에 실패했습니다. 다시 시도 해주세요.')
                }

                customTokenResponse = await handleCustomTokenResponse(guestUid);
                const tokenData = await customTokenResponse.json();
                const { customToken } = tokenData;

                const userCredential = await signInWithCustomToken(auth, customToken);
                idToken = await userCredential.user.getIdToken();

                guestResponse = await handleGuestResponse(idToken, guestUid)
                if (!guestResponse.ok) {
                    const errorData = await guestResponse.json();
                    const errorMessage = guestResponse.status === 403
                        ? '로그인 시도 실패. 다시 시도 해주세요.'
                        : '게스트 로그인에 실패했습니다. 다시 시도 해주세요.';
                    setLoginError(errorMessage);
                    throw new Error(`서버 요청 에러 ${guestResponse.status}: ${errorData.message}`);
                }

                data = await guestResponse.json();
            } else {
                console.log('게스트 로그인 이력 무 : 로직 실행')

                const userCredential = await signInAnonymously(auth);
                signUser = userCredential.user

                idToken = await signUser.getIdToken();
                guestUid = signUser.uid

                guestResponse = await handleGuestResponse(idToken, guestUid)
                if (!guestResponse.ok) {
                    const errorData = await guestResponse.json();
                    const errorMessage = guestResponse.status === 403
                        ? '로그인 시도 실패. 다시 시도 해주세요.'
                        : '게스트 로그인에 실패했습니다. 다시 시도 해주세요.';
                    setLoginError(errorMessage);
                    throw new Error(`서버 요청 에러 ${guestResponse.status}: ${errorData.message}`);
                }

                data = await guestResponse.json();
                const { guestName } = data;
                await updateProfile(signUser, {
                    displayName: guestName,
                    photoURL: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg'
                });
            }

            const { uid, user } = data;
            localStorage.setItem('guestUid', uid);
            setUser({
                name: user.name,
                email: user.email,
                photo: user.photo,
                uid: uid,
            })
            setHasLogin(true);
            await router.push('/home/main');
        } catch (error: unknown) {
            // Firebase 에러 타입 보존
            if (isFirebaseError(error)) {
                console.error("Firebase 오류 발생:", error.code, error.message);
                setLoginError(firebaseErrorMessages[error.code] ?? "알 수 없는 오류가 발생했습니다.");
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    setLoginError(error.message);
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    setLoginError("알 수 없는 오류가 발생했습니다.");
                }
            }
        } finally {
            setIsLoading(false); // 무조건 실행
            setLoadingTag(null);
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
            setEmail('')
            setPassword('')

            setLoginError(null)
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleBackgroundClick);
        };
    }, [hasLogin]);

    // Function
    const GoogleLoginBtn = motion(GoogleButton);
    const GuestLoginBtn = motion(GuestButton);

    return (
        <>
            {pathName === '/login' &&
                <div css={LoginWrap}>
                    <div className="logo_box" css={LogoBox}></div>
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
                            {(loadingTag === 'Login' && isLoading) ?
                                <LoginButton><BeatLoader color="#fff" size={8} /></LoginButton> :
                                <LoginButton
                                    variants={btnVariants}
                                    whileHover="loginHover"
                                    whileTap="loginClick"
                                    type="submit">로그인</LoginButton>
                            }
                        </form>
                        <div className="login_option_wrap">
                            <div className="auto_login_btn">
                                {
                                    hasAutoLogin ?
                                        <button className="auto_on" onClick={() => setHasAutoLogin((prev) => !prev)}>
                                            <div className="auto_on_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746267045/%EC%9E%90%EB%8F%99%EB%A1%9C%EA%B7%B8%EC%9D%B8%EC%B2%B4%ED%81%AC_gaqgly.svg)`}></div>
                                        </button>
                                        :
                                        <button className="auto_off" onClick={() => setHasAutoLogin((prev) => !prev)}></button>
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
                                {(loadingTag === 'Google' && isLoading) ? <GoogleLoginBtn><BeatLoader color="#000" size={8} /></GoogleLoginBtn> : <GoogleLoginBtn
                                    variants={btnVariants}
                                    whileHover="otherHover"
                                    whileTap="otherClick" onClick={handleGoogleLogin}>Google 계정으로 로그인</GoogleLoginBtn>}
                                {(loadingTag === 'Guest' && isLoading) ? <GuestLoginBtn><BeatLoader color="#000" size={8} /></GuestLoginBtn> : <GuestLoginBtn
                                    variants={btnVariants}
                                    whileHover="otherHover"
                                    whileTap="otherClick" onClick={handleGuestLogin}>게스트 로그인</GuestLoginBtn>}
                            </div>
                        </OtherLoginWrap>
                    </LoginButtonWrap >
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