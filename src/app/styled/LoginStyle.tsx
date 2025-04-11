/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";

export const LoginTitle = styled.h2` 
    font-size: 1.5rem;
    font-family: var(--font-pretendard-bold);
    font-weight: 700;
`
export const LoginOr = styled.span`
    font-size: 0.875rem;
    color: #c7c7c7;
    font-family: var(--font-pretendard-light);
    font-weight: 500;
    text-align: center;
`
export const LoginBlack = styled.div`
    width: 100%;
    height: 100%;
    backdrop-filter: brightness(30%);
`
export const LoginSpan = styled.span`
    display: block;
    font-size: 0.875rem;
    margin-right: 4px;
    font-family: var(--font-pretendard-medium);
    font-weight: 500;
`
export const LoginInput = styled.input`
    width: 100%;
    margin-bottom: 6px;
    padding: 16px 8px;
    border-radius: 4px;
    border : 1px solid #ededed;
    font-size: 1rem;
    font-family: var(--font-pretendard-medium);
    font-weight: 500;

    &:focus {
        outline: none;
    }
`

