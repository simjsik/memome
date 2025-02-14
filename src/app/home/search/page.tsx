import SearchClient from "./searchClient";

export const revalidate = 60; // 60초마다 페이지를 재생성(ISR)

export default async function SearchPage() {
    return (
        <>
            <SearchClient />
        </>
    )
}

