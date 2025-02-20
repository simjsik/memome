import ClientBookmark from './ClientBookmark'
import { BookmarkWrap } from '@/app/styled/PostComponents';

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