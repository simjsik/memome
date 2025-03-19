import React from "react";
import { BeatLoader } from "react-spinners";
import { PostWrap } from "./styled/PostComponents";
import { LoadingBox } from "./components/LoadingWrap";

export default function Loading() {
    return (
        <PostWrap>
            <LoadingBox>
                <BeatLoader color="#0087ff" size={8} />
            </LoadingBox>
        </PostWrap>
    )
}