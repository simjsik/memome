import { db } from "@/app/DB/firebaseConfig";
import { Comment, PostData } from "@/app/state/PostState";
import { collection, DocumentData, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter, Timestamp, where } from "firebase/firestore";
import { extractImageUrls } from "../utils/extractImageUrls";


// 포스트의 댓글
export const fetchComments = async (postId: string) => {
    try {
        // 포스트 댓글 가져오기
        const commentRef = collection(db, 'posts', postId, 'comments');
        const commentQuery = query(commentRef, orderBy('createAt', 'asc')); // 오름차순 정렬
        const commentSnap = await getDocs(commentQuery);

        return commentSnap.docs.map((commentDoc) => ({
            ...commentDoc.data(),
            id: commentDoc.id,
            createAt: new Date(commentDoc.data().createAt.seconds * 1000).toISOString(), // 개별 댓글의 createAt 변환
        })) as Comment[]
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// 포스트 페이지 입장 시 '작성자'의 모든 글
export const fetchPostList = async (postId: string, userId: string) => {
    try {
        // 현재 포스트 작성자의 모든 글 가져오기
        const postlistRef = collection(db, 'posts');
        const postlistQuery = query(postlistRef, where('userId', '==', userId), orderBy('notice', 'desc'), orderBy('createAt', 'desc'));
        const postlistSnapshot = await getDocs(postlistQuery);

        return postlistSnapshot.docs.map((doc) => ({
            id: doc.id,
            tag: doc.data().tag,
            title: doc.data().title,
            images: doc.data().images,
            createAt: new Date(doc.data().createAt.seconds * 1000).toISOString(),
        }))
    } catch (error) {
        console.error("Error fetching data:", error);
    };
}

export const fetchPosts = async (
    pageParam: [boolean, Timestamp] | null = null,
    pageSize: number = 4, // 페이지, 무한 스크롤 시 가져올 데이터 수.
    existingPostCount: number = 0 // 무한 스크롤 때 이미 로드된 데이터 수.
) => {
    const postsToFetch = pageSize - existingPostCount;

    if (postsToFetch <= 0) return { commentSnapshot: [], nextPage: null }; // 추가로 데이터 요청 필요 X

    const queryBase = pageParam?.at(0) ?
        query(
            collection(db, 'posts'),
            where('notice', '==', true),
            orderBy('notice', 'desc'),
            orderBy('createAt', 'desc'),
            limit(postsToFetch) // 필요한 수 만큼 데이터 가져오기
        )
        :
        query(
            collection(db, 'posts'),
            where('notice', '==', false),
            orderBy('notice', 'desc'),
            orderBy('createAt', 'desc'),
            limit(postsToFetch) // 필요한 수 만큼 데이터 가져오기
        )
    const postQuery = pageParam
        ?
        query(
            queryBase,
            startAfter(...pageParam),
        )
        :
        queryBase

    const postSnapshot = await getDocs(postQuery);

    const commentSnapshot: PostData[] = await Promise.all(
        postSnapshot.docs.map(async (doc) => {
            const postData = { id: doc.id, ...doc.data() } as PostData;
            postData.images = extractImageUrls(postData.content);

            // 댓글 개수 가져오기
            const commentRef = collection(db, 'posts', doc.id, 'comments');
            const commentSnapshot = await getDocs(commentRef);
            postData.commentCount = commentSnapshot.size;

            return postData;
        })
    );

    const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서
    // console.log(commentSnapshot, lastVisible?.data(), lastVisible?.data().createAt, '보내는 인자')
    return {
        data: commentSnapshot,
        nextPage: lastVisible
            ? [lastVisible.data().notice, lastVisible.data().createAt] // 정렬 필드 값 배열로 반환
            : null,
    };
};
