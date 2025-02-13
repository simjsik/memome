import { collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import { Comment, ImagePostData, PostData } from "@/app/state/PostState";

// 일반 포스트 무한 스크롤 로직
export const fetchPosts = async (
    userId: string,
    pageParam: [boolean, Timestamp] | null = null,
    pageSize: number = 4, // 무한 스크롤 시 가져올 데이터 수.
) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const startAfterParam = pageParam
            ? [
                pageParam[0], // 첫 번째 값 (예: true/false)
                new Timestamp(pageParam[1].seconds, pageParam[1].nanoseconds) // 변환
            ]
            : null;

        // console.log(startAfterParam?.at(1) instanceof Timestamp, 'PageParam 타입 확인');

        const queryBase =
            query(
                collection(db, 'posts'),
                where('notice', '==', false),
                orderBy('notice', 'desc'),
                orderBy('createAt', 'desc'),
                limit(pageSize) // 필요한 수 만큼 데이터 가져오기
            )

        // console.log(pageParam?.at(1), '= 페이지 시간', pageSize, '= 페이지 사이즈', '받은 인자')

        const postQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(...startAfterParam),
            )
            :
            queryBase

        // console.log(pageParam, 'pageParam', postQuery, 'postQuery', '시작쿼리')

        const postSnapshot = await getDocs(postQuery);

        const postWithComment: PostData[] = await Promise.all(
            postSnapshot.docs.map(async (document) => {
                // 포스트 가져오기
                const postData = { id: document.id, ...document.data() } as PostData;

                // 댓글 개수 가져오기
                const commentRef = getDocs(collection(db, 'posts', document.id, 'comments'));
                // 포스트 데이터에 유저 이름 매핑하기
                const userDocRef = getDoc(doc(db, "users", postData.userId)); // DocumentReference 생성

                const [commentSnapshot, userDoc] = await Promise.all([commentRef, userDocRef]);

                postData.commentCount = commentSnapshot.size;
                const userData = userDoc.data() || { displayName: '', photoURL: '' }
                postData.displayName = userData.displayName;
                postData.PhotoURL = userData.photoURL;

                return postData;
            })
        );

        const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서
        // console.log(lastVisible?.data(), lastVisible?.data().notice, lastVisible?.data().createAt, '보내는 인자')

        return {
            data: postWithComment,
            nextPage: lastVisible
                ? ([lastVisible.data().notice as boolean, lastVisible.data().createAt as Timestamp] as [boolean, Timestamp])
                : null,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 공지사항 포스트 무한 스크롤 로직
export const fetchNoticePosts = async (
    userId: string | null = null,
    pageParam: [boolean, Timestamp] | [boolean, null],
    pageSize: number = 4, // 무한 스크롤 시 가져올 데이터 수.
) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const startAfterParam = (pageParam && pageParam[1])
            ?
            new Timestamp(pageParam[1].seconds, pageParam[1].nanoseconds)// 변환
            : null;

        const queryBase =
            query(
                collection(db, 'posts'),
                where('notice', '==', true),
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

                // 댓글 개수 가져오기
                const commentRef = getDocs(collection(db, 'posts', document.id, 'comments'));
                // 포스트 데이터에 유저 이름 매핑하기
                const userDocRef = getDoc(doc(db, "users", postData.userId)); // DocumentReference 생성

                const [commentSnapshot, userDoc] = await Promise.all([commentRef, userDocRef]);

                postData.commentCount = commentSnapshot.size;
                const userData = userDoc.data() || { displayName: '', photoURL: '' }

                postData.displayName = userData.displayName;
                postData.PhotoURL = userData.photoURL;

                return postData;
            })
        );

        const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서

        return {
            data: postWithComment,
            nextPage: lastVisible
                ? ([lastVisible.data().notice as boolean, lastVisible.data().createAt as Timestamp] as [boolean, Timestamp])
                : ([true, null] as [boolean, null]),
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
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        // 닉네임 매핑을 위한 캐시 초기화
        const userCache = new Map<string, { nickname: string; photo: string | null }>();

        const postIds = bookmarkIds.slice(startIdx, startIdx + pageSize);

        console.log(startIdx, '첫 포스트 인덱스', postIds, '가져올 북마크 ID')

        const postWithComment: PostData[] = (
            await Promise.all(
                postIds.map(async (postId: string) => {
                    // 포스트 가져오기
                    const postRef = doc(db, "posts", postId);
                    const postSnap = await getDoc(postRef);

                    if (!postSnap.exists()) return null;

                    const postsData = postSnap.data()

                    postsData.id = postSnap.id; // 문서 ID를 추가
                    // 댓글 개수 가져오기
                    const commentRef = collection(db, 'posts', postId, 'comments');
                    const commentSnapshot = await getDocs(commentRef);
                    postsData.commentCount = commentSnapshot.size;

                    // 포스트 데이터에 유저 이름 매핑하기
                    if (!userCache.has(postsData.userId)) {
                        const userDocRef = doc(db, "users", postsData.userId); // DocumentReference 생성
                        const userDoc = await getDoc(userDocRef); // 문서 데이터 가져오기

                        const userData = userDoc.exists()
                            ? userDoc.data()
                            : { displayName: 'unknown', PhotoURL: null }

                        userCache.set(postsData.userId, {
                            nickname: userData.displayName,
                            photo: userData.photoURL || null,
                        });
                    }
                    const userData = userCache.get(postsData.userId) || { nickname: 'Unknown', photo: null }
                    postsData.displayName = userData.nickname;
                    postsData.PhotoURL = userData.photo;

                    return postsData as PostData;
                })
            )
        ).filter((post): post is PostData => post !== null);

        // null 값 제거 및 타입 확인
        const validPosts = postWithComment.filter(
            (post): post is PostData => post !== null
        );

        const nextIndex = startIdx + pageSize < bookmarkIds.length ? startIdx + pageSize : undefined;

        // console.log(validPosts, '보내줄 포스트', nextIndex, '다음 페이지 기준')
        return { data: validPosts, nextIndexData: nextIndex };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 포스트의 댓글
export const fetchComments = async (userId: string, postId: string) => {
    try {
        console.log(postId)

        if (!postId || postId === "undefined") {
            throw new Error('존재하지 않는 포스트입니다.');
        }

        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        // 2. 댓글 가져오기
        const commentRef = collection(db, 'posts', postId, 'comments');
        const commentQuery = query(commentRef, orderBy('createAt', 'asc'));
        const commentSnap = await getDocs(commentQuery);

        if (commentSnap.empty) {
            console.error('댓글이 없습니다.')
            return { comments: [] };
        }

        const userCache = new Map<string, { displayName: string; photoURL: string | null }>();

        // 3. 각 댓글에 대해 작성자 정보 가져오기 (비동기 작업을 Promise.all으로 처리)
        const comments: Comment[] = await Promise.all(
            commentSnap.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();

                const userId: string = data.user;

                // 캐시에 작성자 정보가 없으면 먼저 users 컬렉션에서 조회
                let userData = userCache.get(userId);

                if (!userData) {
                    let userDoc = await getDoc(doc(db, 'users', userId));
                    // 만약 users 컬렉션에 문서가 없으면 guests 컬렉션에서 조회
                    if (!userDoc.exists()) {
                        userDoc = await getDoc(doc(db, 'guests', userId));
                    }
                    if (userDoc.exists()) {
                        userData = userDoc.data() as { displayName: string; photoURL: string | null };
                    } else {
                        userData = { displayName: 'Unknown', photoURL: null };
                    }
                    userCache.set(userId, userData);
                }

                return {
                    id: docSnapshot.id,
                    replyId: data.replyId,
                    user: userId,
                    commentText: data.commentText,
                    createAt: data.createAt,  // 필요하면 Timestamp 처리
                    replies: data.replies || [],
                    parentId: data.parentId || null,
                    displayName: userData.displayName,
                    PhotoURL: userData.photoURL,
                } as Comment;
            })
        );

        console.error(comments)
        return { comments: comments };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('댓글 데이터 반환 실패:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};

// 포스트 페이지 입장 시 '작성자'의 모든 글
export const fetchPostList = async (
    userId: string,
    pageParam: [boolean, Timestamp] | [boolean, null] | null = null,
    pageSize: number = 4, // 무한 스크롤 시 가져올 데이터 수.
) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const startAfterParam = (pageParam && pageParam[1])
            ?
            new Timestamp(pageParam[1].seconds, pageParam[1].nanoseconds)// 변환
            : null;

        // 현재 포스트 작성자의 모든 글 가져오기
        const postlistRef = collection(db, 'posts');

        const queryBase = query(
            postlistRef,
            where('userId', '==', userId),
            orderBy('createAt', 'desc'),
            limit(pageSize)
        );
        // console.log(pageParam?.at(1), '= 페이지 시간', pageSize, '= 페이지 사이즈', '받은 인자')
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
        // console.log(postWithComment, lastVisible?.data(), lastVisible?.data().notice, lastVisible?.data().createAt, '보내는 인자')

        return {
            imageData: imageData,
            postData: postWithComment,
            nextPage: lastVisible
                ? ([lastVisible.data().notice as boolean, lastVisible.data().createAt as Timestamp] as [boolean, Timestamp])
                : null,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    };
};


