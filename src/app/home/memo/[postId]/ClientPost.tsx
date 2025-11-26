/** @jsxImportSource @emotion/react */
"use client";

import { commentModalState, memoCommentCount } from "@/app/state/PostState";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useMediaQuery } from "react-responsive";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { css, useTheme } from "@emotion/react";

const CommentToggle = styled(motion.button)`
    width: 42px;
    height: 42px;
    position: fixed;
    bottom: 100px;
    z-index: 1;
    left: 20px;
    border-radius: 50%;
    border: none;
    background: ${({ theme }) => theme.colors.background};
    padding : 10px;
    box-shadow: 0px 0px 10px #0000002b;
`
export default function Memo({ commentLength }: { commentLength: number }) {
    const setCommentLength = useSetRecoilState<number>(memoCommentCount)
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const setCommentOn = useSetRecoilState<boolean>(commentModalState);
    const theme = useTheme();
    // state

    useEffect(() => {
        setCommentLength(commentLength);
    }, [commentLength])
    // Function

    return (
        <>
            {isMobile &&
                <CommentToggle onClick={() => setCommentOn(true)} aria-label="댓글 토글">
                    <svg viewBox="0 0 67.41 67.41">
                        <g>
                            <path fill='none' css={css`stroke : ${theme.colors.text}; stroke-width: 5;`} d="M48.23,6.7h-29C12.29,6.7,6.7,11.59,6.7,17.62V40.77c0,6,2.61,10.91,9.5,10.91h.91a1.84,1.84,0,0,1,1.95,1.71v5.26c0,1.55,1.88,2.54,3.45,1.81l13.72-8.32a4.9,4.9,0,0,1,2.08-.46h9.92c6.89,0,12.47-4.88,12.47-10.91V17.62C60.7,11.59,55.12,6.7,48.23,6.7Z" />
                            <rect width="67.41" height="67.41" fill='none' />
                        </g>
                    </svg>
                </CommentToggle>
            }
        </>
    );
}