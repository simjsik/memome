import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import ClientBookmark from './ClientBookmark'
import { db } from '@/app/DB/firebaseConfig';
import { BookmarkPostData } from '@/app/state/PostState';

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

        const postContentLoad = bookmarkPosts.map(async (bookmark) => {
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
                } as BookmarkPostData
            }
        })

        // 북마크 데이터 한번에 처리 및 null 값 필터링
        return (await Promise.all(postContentLoad)).filter(Boolean);
    }


    const bookmarks = await fetchBookmark();
    return (
        <>
            <ClientBookmark bookmark={bookmarks} />
        </>
    )
}