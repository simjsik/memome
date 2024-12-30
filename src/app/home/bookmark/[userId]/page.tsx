import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import ClientBookmark from './ClientBookmark'
import { db } from '@/app/DB/firebaseConfig';
import { BookmarkPostData } from '@/app/state/PostState';
import { BookmarkWrap, TitleHeader } from '@/app/styled/PostComponents';

interface BookMarkProps {
    params: {
        userId: string
    }
}

export default async function Bookmark({ params }: BookMarkProps) {
    const { userId } = params

    const fetchBookmark = async () => {
        // 북마크 목록 로드
        const bookmarkRef = collection(db, "users", userId, "bookmarks");
        const querySnapshot = await getDocs(query(bookmarkRef, orderBy('createAt', 'desc')));

        const bookmarkPosts = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            postId: doc.id,
        }));


        const postContentLoad = await Promise.all(bookmarkPosts.map(async (bookmark) => {
            // 포스트 제목 타이틀.
            const postDoc = await getDoc(doc(db, 'posts', bookmark.postId));

            // 포스트 댓글
            const postCommentDoc = collection(db, 'posts', bookmark.postId, 'comments');
            const postComments = await getDocs(postCommentDoc)
            if (postDoc.exists()) {
                const data = postDoc.data();
                return {
                    tag: data.tag,
                    id: postDoc.id,
                    title: data.title,
                    userId: data.userId,
                    comment: postComments.size,
                    createAt: data.createAt
                } as BookmarkPostData
            }
            return null; // 포스트가 존재하지 않을 경우 null 반환
        }));

        return postContentLoad.filter((post): post is BookmarkPostData => post !== null);
    };


    const bookmarks = await fetchBookmark();
    return (
        <>
            <BookmarkWrap>
                <TitleHeader>
                    <p className='all_post'>내 북마크</p>
                    <div className='post_header'>
                        <p className='h_title'>제목</p>
                        <p className='h_user'>작성자</p>
                        <p className='h_date'>북마크 날짜</p>
                    </div>
                </TitleHeader>
                <ClientBookmark bookmark={bookmarks} />
            </BookmarkWrap>
        </>
    )
}