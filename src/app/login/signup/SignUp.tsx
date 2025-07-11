/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use client';

import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { css, useTheme } from "@emotion/react";
import { CreateInput, LoginButton, LoginButtonWrap, } from "@/app/styled/LoginComponents";
import { auth } from "@/app/DB/firebaseConfig";
import { motion } from "framer-motion";
import { LoginWrap, LogoBox } from "../LoginBox";
import { useRouter } from "next/navigation";
import { btnVariants } from "@/app/styled/motionVariant";

interface FirebaseError extends Error {
    code: string;
}

const SignUpForm = css`
    margin-top : 10px;

    >div{
        margin-top : 20px;

        .password_confirm_wrap{
            position: relative;
        }

        .password_confirm{
            position: absolute;
            right: 10px;
            top: 57%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            background-size: cover;
            background-repeat: no-repeat;
        }

        .display_name_wrap{
            position : relative;

            span{
            display : block;
            position : absolute;
            right : 10px;
            top : 57%;
            transform: translateY(-50%);
            font-size : 0.875rem;
            }
        }
    }

    label{
        font-size : 0.875rem;
        font-family: var(--font-pretendard-medium);
    }
`

const SignUpWrap = css`
    padding: 160px 40px 40px;

    .sign_up_complete{
        text-align: center;
    }
    
    .sign_up_text{
        font-size: 1.25rem;
        font-family: var(--font-pretendard-bold);
        line-height: 28px;
    }

    .sign_up_img{
        width: 92px;
        height: 92px;
        margin: 0 auto;
        margin-top: 12px;
        background-size : cover;
        background-repeat : no-repeat;
    }

    span{
        font-family: var(--font-pretendard-light);
        display: block;
        margin-top: 12px;
    }

    button{
        margin-top : 60px
    }


`
export default function SignUp() {
    const theme = useTheme();
    const [passwordConfirm, setPasswordConfirm] = useState<boolean>(true);
    const [signUpDone, setSignUpDone] = useState<boolean>(false);

    const router = useRouter();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });
    const [errors, setErrors] = useState({
        displayName: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });

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

    const isFirebaseError = (error: unknown): error is FirebaseError => {
        return (
            error instanceof Error &&
            'code' in error &&
            typeof (error).code === 'string'
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'displayName') {
            if (value.length > 12) {
                setErrors((prev) => ({ ...prev, displayName: '유저 명은 최대 12자 이내로 작성해주세요.' }));
            }

            if (value.length > 20) {
                return;
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' })); // 에러 초기화
    };

    useEffect(() => {
        if (formData) {
            if (formData.password === formData.passwordConfirm) {
                setPasswordConfirm(true)
            } else {
                setPasswordConfirm(false)
            }

            if (formData.displayName.length > 12) {
            }

            if (formData.displayName.length > 20) {
                return;
            }
        }
    }, [formData])

    const handleSubmit = async () => {
        const { displayName, email, password, passwordConfirm } = formData;

        // 기본 검증 (유저 명 길이, 비밀번호 길이, 이메일 형식)        
        if (displayName.length > 12) {
            setErrors((prev) => ({ ...prev, displayName: '유저 명은 최대 12자 이내로 작성해주세요.' }));
            return;
        }

        if (password.length <= 6) {
            setPasswordConfirm(false);
            setErrors((prev) => ({ ...prev, password: '비밀번호는 6자 이상이어야 합니다.' }));
            return;
        }

        if (passwordConfirm !== password) {
            setPasswordConfirm(false);
            setErrors((prev) => ({ ...prev, passwordConfirm: '입력하신 비밀번호와 일치하지 않습니다.' }));
            return;
        }

        try {
            // 이메일/비밀번호로 계정 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const uid = user.uid

            // 사용자 정보 저장 (users 컬렉션)
            const saveUserResponse = await fetch(`/api/saveUser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, displayName }),
            })

            if (!saveUserResponse.ok) {
                const errorData = await saveUserResponse.json();
                throw new Error(`유저 정보 저장 실패 ${saveUserResponse.status}: ${errorData.message}`);
            }

            const randomName = `user-${Math.random().toString(36).substring(2, 10)}`;

            // Firebase Authentication의 프로필 업데이트
            await updateProfile(user, {
                displayName: formData.displayName || randomName,
                photoURL: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
            })

            // 이메일 인증 메일 전송
            await sendEmailVerification(user);

            setSignUpDone(true);
            setFormData({ displayName: '', email: '', password: '', passwordConfirm: '' });
        } catch (error: unknown) {
            // Firebase 에러 처리
            if (isFirebaseError(error)) {
                let errorMessage: string
                console.error("회원가입 중 오류 발생:", error, error.code);
                // Firebase 에러 코드별 메시지 처리
                if (firebaseErrorMessages[error.code]) {
                    errorMessage = firebaseErrorMessages[error.code];
                }
                setErrors((prev) => ({ ...prev, email: errorMessage }));
            }
        }
    };

    const EmotionLoginBtn = motion(LoginButton);

    return (
        <>
            <div css={LoginWrap}>
                <div className="logo_box" css={LogoBox}></div>
                {
                    signUpDone ?
                        <LoginButtonWrap className="sign_up_wrap" css={SignUpWrap}>
                            <div className="sign_up_complete">
                                <div className="sign_up_text">
                                    <p>회원가입이</p>
                                    <p>완료되었습니다.</p>
                                </div>
                                <div className="sign_up_img" css={css`background : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744961861/MEMON_ddyqiy.svg);`}></div>
                                <span>로그인 후 다양한 이야기를 메모 해주세요!</span>
                                <EmotionLoginBtn
                                    variants={btnVariants(theme)}
                                    whileHover="loginHover"
                                    whileTap="loginClick"
                                    onClick={() => router.push('/login')}>로그인 하러가기</EmotionLoginBtn>
                            </div>
                        </LoginButtonWrap>
                        :
                        <LoginButtonWrap className="sign_up_wrap">
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} css={SignUpForm}>
                                <div>
                                    <label>이메일</label>
                                    <CreateInput
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="sign_error" style={{ color: 'red' }}>{errors.email}</p>}
                                </div>
                                <div>
                                    <label>비밀번호</label>
                                    <CreateInput
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && <p className="sign_error" style={{ color: 'red' }}>{errors.password}</p>}
                                </div>
                                <div>
                                    <label>비밀번호 재확인</label>
                                    <div className="password_confirm_wrap">
                                        <CreateInput
                                            type="password"
                                            name="passwordConfirm"
                                            value={formData.passwordConfirm}
                                            onChange={handleChange}
                                        />
                                        {formData.passwordConfirm.length > 0 ?
                                            passwordConfirm ?
                                                <div className="password_confirm" style={{ backgroundImage: "url('https://res.cloudinary.com/dsi4qpkoa/image/upload/v1737001778/%EB%8F%BC_u51jrc.svg')" }}></div>
                                                :
                                                <div className="password_confirm" style={{ backgroundImage: "url('https://res.cloudinary.com/dsi4qpkoa/image/upload/v1737001779/%EC%95%88%EB%8F%BC_ncnsvh.svg')" }}></div>
                                            :
                                            ''
                                        }
                                    </div>
                                    {errors.passwordConfirm && <p className="sign_error" style={{ color: 'red' }}>{errors.passwordConfirm}</p>}
                                </div>
                                <div>
                                    <label>유저 명</label>
                                    <div className="display_name_wrap">
                                        <CreateInput
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                        />
                                        <span>{formData.displayName.length} / 12</span>
                                    </div>
                                    {errors.displayName && <p className="sign_error" style={{ color: 'red' }}>{errors.displayName}</p>}
                                </div>
                                <EmotionLoginBtn
                                    variants={btnVariants(theme)}
                                    whileHover="loginHover"
                                    whileTap="loginClick"
                                    type="submit">회원가입</EmotionLoginBtn>
                                <motion.button
                                    variants={btnVariants(theme)}
                                    whileHover="otherHover"
                                    whileTap="otherClick"
                                    className="login_back" onClick={(e) => { e.preventDefault(); router.push('/login') }}>기존 계정으로 로그인</motion.button>
                            </form>
                        </LoginButtonWrap >
                }
                <div className="copyright_box">
                    <p>본 사이트는 포트폴리오 사이트입니다.</p>
                    <p>로그인 및 회원가입 시 사이트 이용에 필요한 정보 외 사용되지 않습니다.</p>
                    <span>ⓒ 2025. SIM HYEOK BO All rights reserved.</span>
                </div>
            </div >
        </>
    )
}
