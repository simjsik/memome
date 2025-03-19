import React from "react";
import { LoadingBox } from "./components/LoadingWrap";
import { MoonLoader } from "react-spinners";

export default function Loading() {
    return (
        <LoadingBox>
            <MoonLoader color="#0087ff" size={10} />
        </LoadingBox>
    )
}