import ClientBookmark from './ClientBookmark'
import { BookmarkWrap, TitleHeader } from '@/app/styled/PostComponents';
import { fetchBookmarks } from '@/app/api/loadToFirebasePostData/fetchPostData';

interface BookMarkProps {
    params: {
        userId: string
    }
}

export default async function Bookmark({ params }: BookMarkProps) {
    const { userId } = params

    return (
        <>
            <BookmarkWrap>
                <p className='all_post'>내 북마크</p>
                <ClientBookmark />
            </BookmarkWrap>
        </>
    )
}