import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../utils/redisClient";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import { PostData } from "@/app/state/PostState";

// 일반 포스트 무한 스크롤 로직
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, pageParam, pageSize } = body;

    const startAfterParam = pageParam
        ? [
            pageParam[0], // 첫 번째 값 (예: true/false)
            new Timestamp(pageParam[1].seconds, pageParam[1].nanoseconds) // 변환
        ]
        : null;

    // console.log(startAfterParam?.at(1) instanceof Timestamp, 'PageParam 타입 확인');
    try {
        // 닉네임 매핑을 위한 캐시 초기화
        const user = await getSession(userId);

        if (!user) {
            return NextResponse.json({ message: '유효하지 않은 유저 또는 유저 세션 정보 만료' }, { status: 401 });
        }

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
                const userData = userDoc.data() || { nickname: '', photo: '' }

                postData.displayName = userData.nickname;
                postData.PhotoURL = userData.photo;

                return postData;
            })
        );

        const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서
        // console.log(lastVisible?.data(), lastVisible?.data().notice, lastVisible?.data().createAt, '보내는 인자')

        return NextResponse.json(
            {
                data: postWithComment,
                nextPage: lastVisible
                    ? [lastVisible.data().notice, lastVisible.data().createAt as Timestamp] // 정렬 필드 값 배열로 반환
                    : null,
            }
        );
    } catch (error: any) {
        console.error('Error in fetchPosts:', error.message);
        throw error;
    }
};