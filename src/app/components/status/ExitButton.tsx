/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { commentModalState } from "@/app/state/PostState";
import { btnVariants } from "@/app/styled/motionVariant";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { useSetRecoilState } from "recoil";

export const ExitButtons = styled(motion.button)`
position : absolute;
bottom: 20px;
width : calc(100% - 40px);
height : 52px;
background : #fff;
color : #191919;
border : 1px solid #ededed;
border-radius : 4px;
font-size : 1rem;
font-family : var(--font-pretendard-medium);
cursor : pointer;
`

export default function ExitButton() {
    const setCommentOn = useSetRecoilState<boolean>(commentModalState);
    const theme = useTheme();
    return (
        <ExitButtons
            variants={btnVariants(theme)}
            whileHover="otherHover"
            whileTap="otherClick"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCommentOn(false); }}>닫기</ExitButtons>
    )
}