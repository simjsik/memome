import { db } from "@/app/DB/firebaseConfig";
import { PostData } from "@/app/state/PostState";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const body = await req.json();
    const { bookmarkIds, startIdx, pageSize } = body;

    if (bookmarkIds.length <= 0) return;

    // 닉네임 매핑을 위한 캐시 초기화
    const userCache = new Map<string, { nickname: string; photo: string | null }>();

    const postIds = bookmarkIds.slice(startIdx, startIdx + pageSize);

    console.log(startIdx, '첫 포스트 인덱스', postIds, '가져올 북마크 ID')

    try {
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
        ).filter((post: PostData) => post !== null);

        // null 값 제거 및 타입 확인
        const validPosts = postWithComment.filter(
            (post): post is PostData => post !== null
        );

        const nextIndex =
            startIdx + pageSize < bookmarkIds.length ? startIdx + pageSize : undefined;

        // console.log(validPosts, '보내줄 포스트', nextIndex, '다음 페이지 기준')

        return NextResponse.json(
            { validPosts, nextIndex }
        )
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('북마크 데이터 반환 실패:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};