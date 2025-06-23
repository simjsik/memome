import { collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import { Comment, ImagePostData, PostData } from "@/app/state/PostState";
import { Reply } from "../hook/CommentMutate";

// 1) 모듈 레벨에서 사용자 정보 캐시 선언 (한 번만 초기화됨)
const userCache = new Map<string, { displayName: string; photoURL: string }>();

async function getCachedUserInfo(userId: string) {
    if (userCache.has(userId)) {
        // 이미 한 번 읽은 값이 있으면 바로 리턴
        return userCache.get(userId)!;
    }

    // 캐시에 없으면 Firestore에서 조회
    let userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc) {
        userDoc = await getDoc(doc(db, "guest", userId));
    }
    const userData = userDoc.data() || { displayName: '', photoURL: '' };
    const user = {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
    };

    // 캐시에 저장
    userCache.set(userId, user);
    return user;
}

// 일반 포스트 무한 스크롤 로직
export const fetchPosts = async (
    userId: string,
    pageParam: Timestamp | undefined,
    pageSize: number,
) => {
    try {
        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        const limitData = await LimitResponse.json();
        if (!LimitResponse.ok) {
            throw new Error(limitData.message || '데이터 요청에 실패했습니다.');
        }
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }

        const startAfterParam = pageParam
            ?
            new Timestamp(pageParam.seconds, pageParam.nanoseconds) // 변환
            : null;

        const queryBase =
            query(
                collection(db, 'posts'),
                where('notice', '==', false),
                orderBy('createAt', 'desc'),
                limit(pageSize) // 필요한 수 만큼 데이터 가져오기
            )

        const postQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(startAfterParam),
            )
            :
            queryBase

        const postSnapshot = await getDocs(postQuery);

        const postWithComment: PostData[] = await Promise.all(
            postSnapshot.docs.map(async (document) => {
                // 포스트 가져오기
                const postData = { id: document.id, ...document.data() } as PostData;

                // 포스트 데이터에 유저 이름 매핑하기
                const userData = await getCachedUserInfo(postData.userId);
                postData.displayName = userData.displayName;
                postData.photoURL = userData.photoURL;

                return postData;
            })
        );

        const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서

        return {
            data: postWithComment,
            nextPage: lastVisible
                ? lastVisible.data().createAt as Timestamp
                : undefined,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 공지사항 포스트 무한 스크롤 로직
export const fetchNoticePosts = async (
    userId: string,
    pageParam: Timestamp | undefined,
) => {
    try {
        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        const limitData = await LimitResponse.json();
        if (!LimitResponse.ok) {
            throw new Error(limitData.message || '데이터 요청에 실패했습니다.');
        }
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }

        const startAfterParam = pageParam
            ?
            new Timestamp(pageParam.seconds, pageParam.nanoseconds)// 변환
            : null;

        const queryBase =
            query(
                collection(db, 'posts'),
                where('notice', '==', true),
                orderBy('createAt', 'desc'),
                limit(4) // 필요한 수 만큼 데이터 가져오기
            )

        const postQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(startAfterParam),
            )
            :
            queryBase

        const postSnapshot = await getDocs(postQuery);

        const postWithComment: PostData[] = await Promise.all(
            postSnapshot.docs.map(async (document) => {
                // 포스트 가져오기
                const postData = { id: document.id, ...document.data() } as PostData;

                // 포스트 데이터에 유저 이름 매핑하기
                const userData = await getCachedUserInfo(postData.userId);
                postData.displayName = userData.displayName;
                postData.photoURL = userData.photoURL;

                return postData;
            })
        );

        const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서
        return {
            data: postWithComment,
            nextPage: lastVisible
                ? lastVisible.data().createAt as Timestamp
                : undefined,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 북마크 무한 스크롤 로직
export const fetchBookmarks = async (
    userId: string,
    bookmarkIds: string[], // currentBookmark 배열
    startIdx: number, // 시작 인덱스
    pageSize: number = 4 // 페이지당 데이터 수
) => {
    if (bookmarkIds.length <= 0) return;
    try {
        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        const limitData = await LimitResponse.json();
        if (!LimitResponse.ok) {
            throw new Error(limitData.message || '데이터 요청에 실패했습니다.');
        }
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }

        const postIds = bookmarkIds.slice(startIdx, startIdx + pageSize);

        const postWithComment: PostData[] = (
            await Promise.all(
                postIds.map(async (postId: string) => {
                    // 포스트 가져오기
                    const postRef = doc(db, "posts", postId);
                    const postSnap = await getDoc(postRef);

                    if (!postSnap.exists()) return null;

                    const postData = postSnap.data()

                    postData.id = postSnap.id; // 문서 ID를 추가
                    // 포스트 데이터에 유저 이름 매핑하기
                    const userData = await getCachedUserInfo(postData.userId);

                    postData.displayName = userData.displayName;
                    postData.photoURL = userData.photoURL;

                    return postData as PostData;
                })
            )
        ).filter((post): post is PostData => post !== null);

        // null 값 제거 및 타입 확인
        const validPosts = postWithComment.filter(
            (post): post is PostData => post !== null
        );

        const nextIndex = startIdx + pageSize < bookmarkIds.length ? startIdx + pageSize : undefined;

        return {
            data: validPosts,
            nextIndexData: nextIndex ? nextIndex : undefined,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 포스트의 댓글
export const fetchComments = async (userId: string, postId: string, pageParam: Timestamp | undefined) => {
    try {
        if (!postId || postId === "undefined") {
            console.error('존재하지 않는 포스트입니다.')
            return { data: [], nextPage: undefined };
        }

        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        const limitData = await LimitResponse.json();
        if (!LimitResponse.ok) {
            throw new Error(limitData.message || '데이터 요청에 실패했습니다.');
        }
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }

        const startAfterParam = pageParam
            ?
            new Timestamp(pageParam.seconds, pageParam.nanoseconds) // 변환
            : null;

        const queryBase =
            query(
                collection(db, 'posts', postId, 'comments'),
                orderBy('createAt', 'asc'),
                limit(4) // 필요한 수 만큼 데이터 가져오기
            )

        const commentQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(startAfterParam),
            )
            :
            queryBase
        // 2. 댓글 가져오기
        const commentSnap = await getDocs(commentQuery);

        if (commentSnap.empty) {
            return { data: [], nextPage: undefined };
        }


        // 3. 각 댓글에 대해 작성자 정보 가져오기 (비동기 작업을 Promise.all으로 처리)
        const comments: Comment[] = await Promise.all(
            commentSnap.docs.map(async (docSnapshot) => {
                const commentData = { id: docSnapshot.id, ...docSnapshot.data() } as Comment;
                const userId: string = commentData.uid;
                // 캐시에 작성자 정보가 없으면 먼저 users 컬렉션에서 조회
                const userData = await getCachedUserInfo(userId);
                commentData.displayName = userData.displayName;
                commentData.photoURL = userData.photoURL;

                return commentData;
            })
        );

        const lastVisible = commentSnap.docs.at(-1); // 마지막 문서

        return {
            data: comments,
            nextPage: lastVisible
                ? lastVisible.data().createAt as Timestamp
                : undefined,
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('댓글 데이터 반환 실패:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};

export const fetchReplies = async (userId: string, postId: string, commentId: string, pageParam: Timestamp | undefined) => {
    try {
        if (!postId || postId === "undefined") {
            console.error('존재하지 않는 포스트입니다.')
            return { data: [], nextPage: undefined };
        }

        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        const limitData = await LimitResponse.json();
        if (!LimitResponse.ok) {
            throw new Error(limitData.message || '데이터 요청에 실패했습니다.');
        }
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }

        const startAfterParam = pageParam
            ?
            new Timestamp(pageParam.seconds, pageParam.nanoseconds) // 변환
            : null;

        const queryBase =
            query(
                collection(db, 'posts', postId, 'comments', commentId, 'reply'),
                orderBy('createAt', 'asc'),
                limit(4) // 필요한 수 만큼 데이터 가져오기
            )


        const commentQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(startAfterParam),
            )
            :
            queryBase
        // 2. 댓글 가져오기
        const commentSnap = await getDocs(commentQuery);

        if (commentSnap.empty) {
            console.error('댓글 데이터가 없습니다.')
            return { data: [], nextPage: undefined };
        }

        // 3. 각 댓글에 대해 작성자 정보 가져오기 (비동기 작업을 Promise.all으로 처리)
        const comments: Reply[] = await Promise.all(
            commentSnap.docs.map(async (docSnapshot) => {
                const replyData = docSnapshot.data() as Reply;

                const userId: string = replyData.uid;

                // 캐시에 작성자 정보가 없으면 먼저 users 컬렉션에서 조회
                const userData = await getCachedUserInfo(userId);
                replyData.displayName = userData.displayName;
                replyData.photoURL = userData.photoURL;

                return replyData;
            })
        );

        const lastVisible = commentSnap.docs.at(-1); // 마지막 문서

        return {
            data: comments,
            nextPage: lastVisible
                ? lastVisible.data().createAt as Timestamp
                : undefined,
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('댓글 데이터 반환 실패:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};

export const fetchPostList = async (
    userId: string,
    pageParam: Timestamp | undefined,
) => {
    try {
        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        const limitData = await LimitResponse.json();
        if (!LimitResponse.ok) {
            throw new Error(limitData.message || '데이터 요청에 실패했습니다.');
        }
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }

        const startAfterParam = pageParam
            ?
            new Timestamp(pageParam.seconds, pageParam.nanoseconds)// 변환
            : null;

        // 현재 포스트 작성자의 모든 글 가져오기
        const postlistRef = collection(db, 'posts');

        const queryBase = query(
            postlistRef,
            where('userId', '==', userId),
            orderBy('createAt', 'desc'),
            limit(6)
        );
        const postQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(startAfterParam),
            )
            :
            queryBase

        const postlistSnapshot = await getDocs(postQuery);

        const postWithComment: PostData[] = await Promise.all(
            postlistSnapshot.docs.map(async (document) => {
                // 포스트 가져오기
                const postData = { id: document.id, ...document.data() } as PostData;

                // 댓글 개수 가져오기
                const commentRef = collection(db, 'posts', document.id, 'comments');
                const commentSnapshot = await getDocs(commentRef);
                postData.commentCount = commentSnapshot.size;

                return postData;
            })
        );

        const imageData: ImagePostData[] = postlistSnapshot.docs.map((document) => {
            const imageData = document.data();

            const mappedImages: string[] | false = (imageData.images === false)
                ? false
                : (Array.isArray(imageData.images) ? imageData.images : []); // 만약 다른 타입이면 빈 배열로 처리

            return {
                id: document.id,
                images: mappedImages
            };
        });

        const lastVisible = postlistSnapshot.docs.at(-1); // 마지막 문서

        return {
            imageData: imageData,
            data: postWithComment,
            nextPage: lastVisible
                ? lastVisible.data().createAt as Timestamp
                : undefined,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    };
};

export const fetchImageList = async (
    userId: string,
    pageParam: Timestamp | undefined,
) => {
    try {
        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        const limitData = await LimitResponse.json();
        if (!LimitResponse.ok) {
            throw new Error(limitData.message || '데이터 요청에 실패했습니다.');
        }
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }

        const startAfterParam = pageParam
            ?
            new Timestamp(pageParam.seconds, pageParam.nanoseconds)// 변환
            : null;

        // 현재 포스트 작성자의 모든 글 가져오기
        const postlistRef = collection(db, 'posts');

        const queryBase = query(
            postlistRef,
            where('userId', '==', userId),
            where('images', '!=', false),
            orderBy('createAt', 'desc'),
            limit(10)
        );

        const postQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(startAfterParam),
            )
            :
            queryBase

        const postlistSnapshot = await getDocs(postQuery);

        const imageData: ImagePostData[] = postlistSnapshot.docs.map((document) => {
            const imageData = document.data();

            const mappedImages: string[] | false = (imageData.images === false)
                ? false
                : (Array.isArray(imageData.images) ? imageData.images : []); // 만약 다른 타입이면 빈 배열로 처리

            return {
                id: document.id,
                images: mappedImages
            };
        });

        const lastVisible = postlistSnapshot.docs.at(-1); // 마지막 문서
        return {
            data: imageData,
            nextPage: lastVisible
                ? lastVisible.data().createAt as Timestamp
                : undefined,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    };
};


