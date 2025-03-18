/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { PostWrap } from "@/app/styled/PostComponents";
import { BeatLoader } from "react-spinners";

export default function LoadingWrap() {
    return (
        <PostWrap><BeatLoader color="red" size={8} /></PostWrap>
    )
}