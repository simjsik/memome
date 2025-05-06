/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from "@emotion/styled";
import { MoonLoader } from "react-spinners";

export const LoadingBox = styled.div`
position : relative;
width : 100%;
height : 60px;
padding : 15px 0px;

  >span{
    margin : 0 auto;
  }
`

export default function LoadingWrap() {
  return (
    <>
      <LoadingBox><MoonLoader color="#0087ff" size={24} /></LoadingBox>
    </>
  )
}

