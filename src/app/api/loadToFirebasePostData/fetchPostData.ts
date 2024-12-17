import { db } from "@/app/DB/firebaseConfig";
import { Comment, PostData } from "@/app/state/PostState";
import { collection, getDoc, doc, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
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
        const postlistQuery = query(postlistRef, where('userId', '==', userId), orderBy('createAt', 'desc'));
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

    // 닉네임 매핑을 위한 캐시 초기화
    const userCache = new Map<string, { nickname: string; photo: string | null }>();

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

    // console.log(pageParam?.at(0), '= 공지사항 여부', pageSize, '= 페이지 사이즈', existingPostCount, '= 현재 데이터 사이즈', postsToFetch, '= 보내줄 데이터 수', '받은 인자')

    const postQuery = pageParam
        ?
        query(
            queryBase,
            startAfter(...pageParam),
        )
        :
        queryBase

    const postSnapshot = await getDocs(postQuery);

    const postWithComment: PostData[] = await Promise.all(
        postSnapshot.docs.map(async (document) => {
            // 포스트 가져오기
            const postData = { id: document.id, ...document.data() } as PostData;
            postData.images = extractImageUrls(postData.content);

            // 댓글 개수 가져오기
            const commentRef = collection(db, 'posts', document.id, 'comments');
            const commentSnapshot = await getDocs(commentRef);
            postData.commentCount = commentSnapshot.size;

            // 포스트 데이터에 유저 이름 매핑하기
            if (!userCache.has(postData.userId)) {
                const userDocRef = doc(db, "users", postData.userId); // DocumentReference 생성
                const userDoc = await getDoc(userDocRef); // 문서 데이터 가져오기

                if (userDoc.exists()) {
                    const userData = userDoc.data() as { displayName: string; photoURL: string | null }; // .data() 호출 필요
                    userCache.set(postData.userId, {
                        nickname: userData.displayName,
                        photo: userData.photoURL || null,
                    });

                } else {
                    userCache.set(postData.userId, {
                        nickname: "Unknown",
                        photo: null,
                    });
                }
            }

            const userData = userCache.get(postData.userId) || { nickname: 'Unknown', photo: null }
            postData.displayName = userData.nickname;
            postData.PhotoURL = userData.photo;

            return postData;
        })
    );

    const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서
    // console.log(postWithComment, lastVisible?.data(), lastVisible?.data().notice, lastVisible?.data().createAt, '보내는 인자')
    return {
        data: postWithComment,
        nextPage: lastVisible
            ? [lastVisible.data().notice, lastVisible.data().createAt] // 정렬 필드 값 배열로 반환
            : null,
    };
};