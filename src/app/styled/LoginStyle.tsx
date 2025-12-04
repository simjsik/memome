/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";

export const LoginTitle = styled.h2` 
    font-size: 1.5rem;
    font-weight: 700;
`
export const LoginOr = styled.span`
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 400;
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
`
export const LoginInput = styled.input`
    width: 100%;
    margin-bottom: 6px;
    padding: 16px 8px;
    border-radius: 4px;
    border : 1px solid ${({ theme }) => theme.colors.border};
    font-size: 1rem;

    &:focus {
        outline: none;
    }
`

