/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { BeatLoader } from "react-spinners";

export default function LoadingWrap() {
    return (
        <BeatLoader color="blue" size={8} />
    )
}