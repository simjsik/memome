/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { MoonLoader } from "react-spinners";
import { loadingState } from "../state/PostState";
import { useRecoilValue } from "recoil";
import styled from "@emotion/styled";

const LoadingWrap = styled.div`
    position: absolute;
    width: 600px;
    left: 500px;
    top: 0;
    bottom: 0;
    z-index: 10;
  >span{
    position: absolute;
    left: 50%;
    top: 45%;
    display: block;
  }
`

export default function GlobalLoadingWrap() {
    const loading = useRecoilValue(loadingState);

    return (
        <>
            {loading &&
                <LoadingWrap>
                    <MoonLoader color="#0087ff" />
                </LoadingWrap >
            }
        </>
    )
}