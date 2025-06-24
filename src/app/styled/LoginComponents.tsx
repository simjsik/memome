/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";
import { motion } from 'framer-motion';

export const LoginButtonWrap = styled.div`
    margin: 0 auto;
    margin-top: 120px;
    width: 520px;
    height: 720px;
    padding: 40px;
    border-radius: 8px;
    
  .login_error_wrap{
    display: flex;
    margin-top: 4px;

    button{
        text-decoration: underline;
        border: none;
        background: none;
        line-height: 15px;
        font-family: 'var(--font-pretendard-light)';
        cursor: pointer;
    }
  }

  .login_error,
  .sign_error{
    font-size: 14px;
    color: ${({ theme }) => theme.colors.error};
    margin-right: 4px;
  }

    .login_back{
        width: 100%;
        height: 52px;
        margin: 20px 0px 4px 0px;
        border: 1px solid ${({ theme }) => theme.colors.primary};
        border-radius: 4px;
        background: #fff;
        color: ${({ theme }) => theme.colors.primary};
        font-size: 16px;
        font-family: var(--font-pretendard-medium);
        cursor: pointer;
    }

    .login_option_wrap{
      display: flex;
      margin-top: 6px;
      justify-content: space-between;

      .auto_login_btn{
        display: flex;

        .auto_off,
        .auto_on{
          width: 20px;
          height: 20px;
          margin-right: 4px;
          border: 1px solid ${({ theme }) => theme.colors.border};
          border-radius: 4px;
          background: ${({ theme }) => theme.colors.background_invisible};
          cursor: pointer;
        }

        .auto_on{
          border: 2px solid ${({ theme }) => theme.colors.primary};

          .auto_on_icon{
            height : 100%;
          }
        }

        p{
          line-height: 20px;
          font-size: 0.875rem;
        }
      }

      .register_wrap{
        display: flex;
        line-height: 20px;
      }
    }

    @media (max-width: 480px) {
        margin-top: 60px;
        width: 100%;
        height: 80%;
        background: ${({ theme }) => theme.colors.background};
        padding: 30px;
        border-radius: 8px;
    }
`

export const LoginInputWrap = styled.div`
    margin-top: 10px;
    padding : 0px;
    border-radius : 4px;
    border : 1px solid ${({ theme }) => theme.colors.border};
    
    div {
    padding: 8px 10px;
    }

    div:nth-of-type(2) {
    width: 100%;
    height: 100%;
    border-top : 1px solid ${({ theme }) => theme.colors.border};
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
            height : 52px;
            margin: 0px;
            margin-top : 8px;
            padding: 4px 8px;
            border : 1px solid ${({ theme }) => theme.colors.border};
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
border-top : 1px solid ${({ theme }) => theme.colors.border};
padding-top : 10px;
`
export const CreateButton = styled.a`
    background: none;
    border: none;
    color : ${({ theme }) => theme.colors.primary};
    font-size : 14px;
    font-family : var(--font-pretendard-bold);
    font-weight: 700;
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
    cursor: pointer;
`

export const LoginButton = styled(motion.button)`
    width: 100%;
    height : 52px;
    margin: 20px 0px 4px 0px;
    border : none;
    border-radius : 4px;
    background : ${({ theme }) => theme.colors.primary};
    color: #fff;
    font-size : 16px;
    font-family : var(--font-pretendard-medium);
    cursor: pointer;
`

export const GoogleButton = styled.button`
    width: 100%;
    height : 48px;
    margin-top : 10px;
    padding : 0px 8px;
    background-color : ${({ theme }) => theme.colors.background};
    color : ${({ theme }) => theme.colors.text};
    border : 1px solid ${({ theme }) => theme.colors.border};
    border-radius : 4px;
    cursor : pointer;
    line-height : 18px;
    font-size : 14px;
    font-family : var(--font-pretendard-medium);
    font-weight: 500;
    cursor: pointer;
`
export const GuestButton = styled.button`
width: 100%;
    height : 48px;
    margin-top : 20px;
    padding : 0px 8px;
    background-color : ${({ theme }) => theme.colors.background};
    color :${({ theme }) => theme.colors.text};
    border : 1px solid ${({ theme }) => theme.colors.border};
    border-radius : 4px;
    cursor : pointer;
    line-height : 18px;
    font-size : 14px;
    font-family : var(--font-pretendard-medium);
    font-weight: 500;
    cursor: pointer;
`

