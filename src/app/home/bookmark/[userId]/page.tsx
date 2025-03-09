import ClientBookmark from './ClientBookmark'
import { BookmarkWrap } from '@/app/styled/PostComponents';
export const dynamic = "force-static"; // 정적 렌더링 설정
export default async function Bookmark() {

    return (
        <>
            <BookmarkWrap>
                <p className='all_post'>내 북마크</p>
                <ClientBookmark />
            </BookmarkWrap>
        </>
    )
}