import SearchClient from "./searchClient";
export const metadata = {
    title: "MEMOME :: 검색",
    description: "메모 검색",
};
export default async function SearchPage() {
    return (
        <>
            <SearchClient />
        </>
    )
}

