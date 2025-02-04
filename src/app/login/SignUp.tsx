/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use client';

import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "../DB/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { LoginTitle } from "../styled/LoginStyle";
import { CreateInput, LoginButton, LoginButtonWrap, LoginModalWrap } from "../styled/LoginComponents";
import { css } from "@emotion/react";
import { signUpState } from "../state/PostState";
import { useRecoilState } from "recoil";
import { usePathname } from "next/navigation";

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
            font-size : 14px;
            }
        }
    }

    label{
        font-size : 14px;
        font-family: var(--font-pretendard-medium);
    }
`

const SignUpWrap = css`
    padding: 160px 40px 40px;

    .sign_up_complete{
        text-align: center;
    }
    
    .sign_up_text{
        font-size: 20px;
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
    const [passwordConfirm, setPasswordConfirm] = useState<boolean>(true);
    const [signUpToggle, setSignUpToggle] = useRecoilState<boolean>(signUpState);
    const [signUpDone, setSignUpDone] = useState<boolean>(false);
    const path = usePathname();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { displayName, email, password, passwordConfirm } = formData;

        // 기본 검증 (유저 명 길이, 비밀번호 길이, 이메일 형식)        
        if (displayName.length > 12) {
            setPasswordConfirm(false);
            setErrors((prev) => ({ ...prev, displayName: '유저 명은 최대 12자 이내로 작성해주세요.' }));
            return;
        }

        if (password.length <= 6) {
            setErrors((prev) => ({ ...prev, password: '비밀번호는 6자 이상이어야 합니다.' }));
            return;
        }

        if (passwordConfirm !== password) {
            setErrors((prev) => ({ ...prev, passwordConfirm: '입력하신 비밀번호와 일치하지 않습니다.' }));
            return;
        }

        try {
            // 이메일/비밀번호로 계정 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const uid = user.uid
            const displayName = formData.displayName

            // 사용자 정보 저장 (users 컬렉션)
            const saveUserResponse = await fetch('/api/utils/saveUserProfile/Firebase', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, displayName }),
            })

            if (!saveUserResponse.ok) {
                const errorData = await saveUserResponse.json();
                throw new Error(`유저 정보 저장 실패 ${saveUserResponse.status}: ${errorData.message}`);
            }

            // Firebase Authentication의 프로필 업데이트
            await updateProfile(user, {
                displayName: formData.displayName,
                photoURL: '',
            })

            // 이메일 인증 메일 전송
            await sendEmailVerification(user);

            setSignUpDone(true);
            setFormData({ displayName: '', email: '', password: '', passwordConfirm: '' });
        } catch (error: any) {
            // Firebase 에러 처리
            const errorMessage =
                error.code === 'auth/email-already-in-use'
                    ? '이미 사용 중인 이메일 입니다.'
                    : error.code === 'auth/invalid-email'
                        ? '유효하지 않는 이메일 입니다.'
                        :
                        '회원가입 중 오류가 발생했습니다.'
                ;
            setErrors((prev) => ({ ...prev, email: errorMessage }));
        }
    };

    return (
        <>
            {path === '/login' ?
                signUpDone ?
                    <LoginButtonWrap className="sign_up_wrap" css={SignUpWrap}>
                        <div className="sign_up_complete">
                            <div className="sign_up_text">
                                <p>회원가입이</p>
                                <p>완료되었습니다.</p>
                            </div>
                            <div className="sign_up_img" css={css`background : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1737009340/%EA%B0%80%EC%9E%85OK_tj25fs.svg);`}></div>
                            <span>로그인 후 다양한 이야기를 메모 해주세요!</span>
                            <LoginButton onClick={() => setSignUpToggle(false)}>로그인 하러가기</LoginButton>
                        </div>
                    </LoginButtonWrap>
                    :
                    <LoginButtonWrap className="sign_up_wrap">
                        <form onSubmit={handleSubmit} css={SignUpForm}>
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
                            <LoginButton type="submit">회원가입</LoginButton>
                            <button className="login_back" onClick={() => setSignUpToggle(false)}>기존 계정으로 로그인</button>
                        </form>
                    </LoginButtonWrap >
                :
                signUpDone ?
                    <LoginModalWrap className="sign_up_wrap" css={SignUpWrap}>
                        <div className="sign_up_complete">
                            <div className="sign_up_text">
                                <p>회원가입이</p>
                                <p>완료되었습니다.</p>
                            </div>
                            <div className="sign_up_img" css={css`background : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1737009340/%EA%B0%80%EC%9E%85OK_tj25fs.svg);`}></div>
                            <span>로그인 후 다양한 이야기를 메모 해주세요!</span>
                            <LoginButton onClick={() => setSignUpToggle(false)}>로그인 하러가기</LoginButton>
                        </div>
                    </LoginModalWrap>
                    :
                    <LoginModalWrap className="sign_up_wrap">
                        <form onSubmit={handleSubmit} css={SignUpForm}>
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
                            <LoginButton type="submit">회원가입</LoginButton>
                            <button className="login_back" onClick={() => setSignUpToggle(false)}>기존 계정으로 로그인</button>
                        </form>
                    </LoginModalWrap >
            }
        </>
    )
}
