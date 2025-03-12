import SearchClient from "./searchClient";
export const dynamic = "force-static"; // 정적 렌더링 설정
export default async function SearchPage() {
    return (
        <>
            <SearchClient />
        </>
    )
}

