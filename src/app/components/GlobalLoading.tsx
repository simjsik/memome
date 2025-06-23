/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { MoonLoader } from "react-spinners";
import { loadingState } from "../state/PostState";
import { useRecoilValue } from "recoil";
import styled from "@emotion/styled";

const LoadingWrap = styled.div`
    position: absolute;
    width: 100%;
    left : 50%;
    transform : translateX(-50%);
    top: 0;
    bottom: 0;
    z-index: 10;
  >span{
    position: absolute;
    top: 45%;
    margin : 0 auto;
  }
`

export default function GlobalLoadingWrap() {
  const loading = useRecoilValue(loadingState);
  return (
    <>
      {loading  &&
        <LoadingWrap>
          <MoonLoader color="#0087ff" />
        </LoadingWrap >
      }
    </>
  )
}