/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use client';

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../DB/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { LoginTitle } from "../styled/LoginStyle";
import { CreateInput, LoginButton, LoginButtonWrap } from "../styled/LoginComponents";
import { css } from "@emotion/react";

const SignUpForm = css`
    margin-top : 10px;

    div{
    margin-top : 20px;
    }
`
export default function SignUp() {
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        photoURL: '',
    });
    const [errors, setErrors] = useState({
        displayName: '',
        email: '',
        password: '',
        photoURL: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' })); // 에러 초기화
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { displayName, email, password, photoURL } = formData;

        // 기본 검증 (비밀번호 길이, 이메일 형식)
        if (password.length <= 6) {
            setErrors((prev) => ({ ...prev, password: '비밀번호는 6자 이상이어야 합니다.' }));
            return;
        }

        try {
            // 이메일/비밀번호로 계정 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 사용자 정보 저장 (users 컬렉션)
            await setDoc(doc(db, 'users', user.uid), {
                userId: user.uid,
                displayName: displayName,
                photoURL: photoURL || '', // 기본 프로필 이미지
                email: email,
            });

            // 이메일 인증 메일 전송
            await sendEmailVerification(user);

            setSuccessMessage('회원가입 성공! 이메일 인증 후 로그인하세요.');
            setFormData({ displayName: '', email: '', password: '', photoURL: '' });
        } catch (error: any) {
            // Firebase 에러 처리
            const errorMessage =
                error.code === 'auth/email-already-in-use'
                    ? '이미 사용 중인 이메일입니다.'
                    : error.code === 'auth/invalid-email'
                        ? '유효한 이메일을 입력하세요.'
                        : error.code === 'auth/weak-password'
                            ? '비밀번호는 6자 이상이어야 합니다.'
                            : '회원가입 중 오류가 발생했습니다.';
            setErrors((prev) => ({ ...prev, email: errorMessage }));
        }
    };

    return (
        <LoginButtonWrap className="signup_wrap">
            <LoginTitle>회원가입</LoginTitle>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            <form onSubmit={handleSubmit} css={SignUpForm}>
                <div>
                    <label>사용자 명</label>
                    <CreateInput
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                    />
                    {errors.displayName && <p style={{ color: 'red' }}>{errors.displayName}</p>}
                </div>
                <div>
                    <label>이메일</label>
                    <CreateInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                </div>
                <div>
                    <label>비밀번호</label>
                    <CreateInput
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                </div>
                <LoginButton type="submit">회원가입</LoginButton>
            </form>
        </LoginButtonWrap>
    )
}
