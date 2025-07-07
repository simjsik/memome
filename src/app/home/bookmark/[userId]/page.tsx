import ClientBookmark from './ClientBookmark'

export const metadata = {
    title: "MEMOME :: 북마크",
    description: "북마크된 메모를 확인해보세요.",
};

export default async function Bookmark() {

    return (
        <ClientBookmark />
    )
}