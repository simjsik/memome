/** @jsxImportSource @emotion/react */

"use client";
import styled from "@emotion/styled";

export const LoginPageWrap = styled.div`
width : 100vw;
height : 100vh;
background-image : url('/img/AdobeStock_295537932.jpeg');
background-size : cover;
`

export const LoginButtonWrap = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 80px;
  width: 520px;
  height: 720px;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow : 0px 0px 10px rgba(0,0,0,0.2);
`

export const LoginInputWrap = styled.div`
    border : 1px solid #bdbdbd;
    margin-top: 10px;
    padding : 0px;
    border-radius : 4px;

    div {
    padding: 8px 10px;
    }

    div:nth-of-type(2) {
    width: 100%;
    height: 100%;
    border-top : 1px solid #bdbdbd;
    }

    p{
    font-size : 14px;
    font-family : var(--font-pretendard-light)
    }
`
export const LoginInput = styled.input`
            width: 100%;
            margin: 0px;
            margin-top : 4px;
            padding: 4px 0px;
            border : none;
            font-size: 16px;
            font-family : var(--font-pretendard-medium);
            font-weight: 500;

            &:focus{
            outline: none;
            }
`
export const OtherLoginWrap = styled.div`
margin-top : 60px;
border-top : 1px solid #e6e6ea;
padding-top : 10px;
`

export const CreateButton = styled.button`
background: none;
    border: none;
    color : #5688FF;
    font-size : 14px;
    font-family : var(--font-pretendard-bold);
    font-weight: 700;
    border-bottom: 1px solid #5688FF;
    cursor: pointer;
`
export const GoogleButton = styled.button`
    width: 100%;
    height : 48px;
    margin-top : 10px;
    padding : 0px 8px;
    background-color : #fff;
    color : #191919;
    border : 1px solid #e6e6ea;
    border-radius : 4px;
    cursor : pointer;
    line-height : 18px;
    font-size : 14px;
    font-family : var(--font-pretendard-medium);
    font-weight: 500;
`
export const NaverButton = styled.button`
    width: 100%;
    height : 48px;
    margin-top : 20px;
    padding : 0px 8px;
    background-color : #fff;
    color : #191919;
    border : 1px solid #e6e6ea;
    border-radius : 4px;
    cursor : pointer;
    line-height : 18px;
    font-size : 14px;
    font-family : var(--font-pretendard-medium);
    font-weight: 500;
`
export const GuestButton = styled.button`
width: 100%;
    height : 48px;
    margin-top : 20px;
    padding : 0px 8px;
    background-color : #fff;
    color : #191919;
    border : 1px solid #e6e6ea;
    border-radius : 4px;
    cursor : pointer;
    line-height : 18px;
    font-size : 14px;
    font-family : var(--font-pretendard-medium);
    font-weight: 500;
`

