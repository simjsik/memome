/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { css } from '@emotion/react';
import {
  LoginPageWrap,
  CreateButton,
  GoogleButton,
  NaverButton,
  GuestButton,
  LoginButtonWrap,
  LoginInputWrap,
  OtherLoginWrap,
} from '../styled/LoginComponents';
import Link from 'next/link';

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

const loginBlack = css`
width : 100%;
height : 100%;
backdrop-filter: brightness(30%);
`

export default function Login() {
  return (
    <LoginPageWrap>
      <div css={loginBlack}>
        <LoginButtonWrap>
          <h2 css={loginTitle}>로그인</h2>
          <LoginInputWrap>
            <input type="text" placeholder='이메일 또는 ID 입력' css={
              css`
            width: 100%;
            margin-top: 12px;
            margin-bottom : 6px;
            padding: 16px 8px;
            border : 1px solid #191919;
            border-radius : 4px;
            font-size: 16px;
            font-family : var(--font-pretendard-medium);
            font-weight: 500;

            &:focus{
            outline: none;
            }
           `
            } />
            <span css={css`
              font-size : 14px;
              margin-right : 4px;
              font-family : var(--font-pretendard-medium);
              font-weight: 500;
               `}>처음 이신가요?</span>
            <CreateButton>회원가입</CreateButton>
          </LoginInputWrap>
          <OtherLoginWrap>
            <h2 css={loginOr}>또는</h2>
            <div>
              <GoogleButton>Google 계정으로 로그인</GoogleButton>
              <NaverButton>네이버 계정으로 로그인</NaverButton>
              <Link href="/">
                <GuestButton>게스트 로그인</GuestButton>
              </Link>
            </div>
          </OtherLoginWrap>
        </LoginButtonWrap>
      </div>
    </LoginPageWrap>
  );
}
