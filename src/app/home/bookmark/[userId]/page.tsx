import ClientBookmark from './ClientBookmark'
import { BookmarkWrap } from '@/app/styled/PostComponents';
export const dynamic = "force-static"; // 정적 렌더링 설정

export const metadata = {
    title: "MEMOME :: 홈",
    description: "최근 공유된 메모를 확인해보세요.",
};

export default async function Bookmark() {

    return (
        <>
            <BookmarkWrap>
                <ClientBookmark />
            </BookmarkWrap>
        </>
    )
}