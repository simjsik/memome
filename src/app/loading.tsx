import React from "react";
import { BeatLoader } from "react-spinners";
import { PostWrap } from "./styled/PostComponents";

export default function Loading() {
    return (
        <PostWrap>
            <BeatLoader color="red" size={8} />
        </PostWrap>
    )
}