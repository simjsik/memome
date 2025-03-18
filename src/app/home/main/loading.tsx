/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { PostWrap } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { BeatLoader } from "react-spinners";

export default function LoadingWrap() {
    return (
        <PostWrap><BeatLoader color="red" size={8} />
            <div css={css`
                background-color : red});
                position : absolute;
                left : 0;
                top : 0;
                bottom : 0;
                right :0;
                width : 100%;
                height : 100%;
                z-index : 10000;
                `}></div>
        </PostWrap>
    )
}