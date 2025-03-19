/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from "@emotion/styled";
import { MoonLoader } from "react-spinners";

export const LoadingBox = styled.div`
position : relative;
width : 100%;
height : 60px;
  >span{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(50%, 50%);
    display: block;
  }
`

export default function LoadingWrap() {
    return (
        <LoadingBox>
            <MoonLoader color="#0087ff" size={8} />
        </LoadingBox>
    )
}

