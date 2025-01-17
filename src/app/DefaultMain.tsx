/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DefaultMain() {
    const router = useRouter();

    useEffect(() => {
        router.push('/home/main')
    }, [])

    return (
        <></>
    )
}