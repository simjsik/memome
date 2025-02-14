/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import SearchClient from "./searchClient";
export const revalidate = 60;

export default async function SearchPage() {
    return (
        <>
            <SearchClient />
        </>
    )
}

