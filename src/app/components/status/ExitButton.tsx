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
background : ${({ theme }) => theme.colors.background};
color : ${({ theme }) => theme.colors.text};
border : 1px solid ${({ theme }) => theme.colors.border};
border-radius : 4px;
font-size : 1rem;
font-family : var(--font-pretendard-medium);
cursor : pointer;

    @media (min-width : 481px) and (max-width: 1200px) {

    }

    @media (min-width: 1921px) {
    }

    @media (min-width: 2560px) {

    }

    @media (min-width: 3840px) {

    }
        
    @media (min-width: 5120px) {

    }
`

export default function ExitButton() {
    const setCommentOn = useSetRecoilState<boolean>(commentModalState);
    const theme = useTheme();
    return (
        <ExitButtons
            variants={btnVariants(theme)}
            whileHover="otherHover"
            whileTap="otherClick"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCommentOn(false); }}
            aria-label="댓글 닫기">닫기</ExitButtons>
    )
}