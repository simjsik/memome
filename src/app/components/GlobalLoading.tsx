/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { MoonLoader } from "react-spinners";
import { loadingState } from "../state/PostState";
import { useRecoilValue } from "recoil";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";

const LoadingWrap = styled.div`
    position: absolute;
    width: 600px;
    left : clamp(80px, calc(80px + (100vw - 768px) * 0.5), 25%);
    top: 0;
    bottom: 0;
    z-index: 10;
  >span{
    position: absolute;
    top: 45%;
    margin : 0 auto;
  }
  @media (max-width: 768px) {
    left: 80px;
    width: calc(100% - 80px);
    max-width: 600px;
  }
  @media (min-width: 1200px) and (max-width : 1920px) {
    left : clamp(80px, calc(80px + (100vw - 1200px) * 0.53), 50vw);
  }

  @media (min-width: 1921px) {
    width: clamp(600px, calc(600px + (100vw - 1920px) * 0.3125), 800px);
  }

  @media (min-width: 2560px) {
    width: clamp(800px, calc(800px + (100vw - 2560px) * 0.3125), 1200px);
  }

  @media (min-width: 3840px) {
    width: clamp(1200px, calc(1200px + (100vw - 3840px) * 0.3125), 1600px);
  }
`

export default function GlobalLoadingWrap() {
    const loading = useRecoilValue(loadingState);
    const pathName = usePathname();
    return (
        <>
            {loading && !pathName.startsWith("/home/memo") &&
                <LoadingWrap>
                    <MoonLoader color="#0087ff" />
                </LoadingWrap >
            }
        </>
    )
}