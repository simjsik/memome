import { db } from "@/app/DB/firebaseConfig";
import { PostData } from "@/app/state/PostState";
import { collection, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";


// 프로필 페이지 입장 시 '작성자'의 모든 글
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, pageParam, pageSize } = body;

    const startAfterParam = (pageParam && pageParam[1])
        ?
        new Timestamp(pageParam[1].seconds, pageParam[1].nanoseconds)// 변환
        : null;

    // 현재 포스트 작성자의 모든 글 가져오기
    try {
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

        const lastVisible = postlistSnapshot.docs.at(-1); // 마지막 문서
        // console.log(postWithComment, lastVisible?.data(), lastVisible?.data().notice, lastVisible?.data().createAt, '보내는 인자')

        return NextResponse.json(
            {
                data: postWithComment,
                nextPage: lastVisible
                    ? [lastVisible.data().notice, lastVisible.data().createAt as Timestamp] // 정렬 필드 값 배열로 반환
                    : null,
            }
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    };
};