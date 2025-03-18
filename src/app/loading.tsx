import React from "react";
import { BeatLoader } from "react-spinners";
import { PostWrap } from "./styled/PostComponents";

export default function LoadingWrap() {
    return (
        <PostWrap>
            <BeatLoader color="red" size={8} />
        </PostWrap>
    )
}