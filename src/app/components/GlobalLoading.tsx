/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { MoonLoader } from "react-spinners";
import { LoadingBox } from "./LoadingWrap";

export default function GlobalLoadingWrap() {
    return (
        <LoadingBox>
            <MoonLoader color="#0087ff" size={12} />
        </LoadingBox>
    )
}