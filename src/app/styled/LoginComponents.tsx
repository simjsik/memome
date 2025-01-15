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
  left : 50%;
  transform: translate(-50%, -50%);
  width: 520px;
  height: 720px;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow : 0px 0px 10px rgba(0,0,0,0.2);
`

export const LoginInputWrap = styled.div`
    margin-top: 10px;
    padding : 0px;
    border-radius : 4px;
    border : 1px solid #ededed;
    
    div {
    padding: 8px 10px;
    }

    div:nth-of-type(2) {
    width: 100%;
    height: 100%;
    border-top : 1px solid #ededed;
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

export const CreateInput = styled.input`
            width: 100%;
            height : 42px;
            margin: 0px;
            margin-top : 8px;
            padding: 4px 0px;
            border : 1px solid #ededed;
            border-radius : 8px;
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

export const LoginButton = styled.button`
width: 100%;
height : 52px;
margin: 20px 0px 4px 0px;
border : none;
border-radius : 4px;
background : #272D2D;
color: #fff;
font-size : 16px;
font-family : var(--font-pretendard-medium);
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

