/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from "@emotion/styled";
import { MoonLoader } from "react-spinners";

export const Load = styled.div`
    position: absolute;
    align-items: center;
    display: flex;
    justify-content: center;
    inset: 0;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.blur};
    backdrop-filter: blur(8px);
    z-index: 1;

  >span{
    margin : 0 auto;
  }
`

export default function LoadLoading() {
  return (
    <>
      <Load><MoonLoader color="#0087ff" size={36} /></Load>
    </>
  )
}

