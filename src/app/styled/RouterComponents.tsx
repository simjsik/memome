/** @jsxImportSource @emotion/react */

'use client';

import styled from "@emotion/styled";

export const HomeBtn = styled.button`
position: fixed;
left : 360px;
top : 40px;

width: 48px;
height: 48px;
background: ${({ theme }) => theme.colors.background};
border : 1px solid ${({ theme }) => theme.colors.border};

&:hover{
cursor : pointer;
}
`