import { db } from "@/app/DB/firebaseConfig";
import { collection, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// 이미지 포스트 무한 스크롤 로직
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, pageParam, pageSize } = body;

    const startAfterParam = (pageParam && pageParam[1])
        ?
        new Timestamp(pageParam[1].seconds, pageParam[1].nanoseconds)// 변환
        : null;

    // console.error(startAfterParam, '페이지 Param')
    try {
        const queryBase = query(
            collection(db, 'posts'),
            where('notice', '==', false),
            where('userId', '==', userId),
            where('images', '!=', false), // images 필드가 false가 아닌 문서만 필터링
            orderBy('createAt', 'desc'),
            limit(pageSize) // 필요한 수 만큼 데이터 가져오기
        );

        const postQuery = startAfterParam
            ?
            query(
                queryBase,
                startAfter(startAfterParam),
            )
            :
            queryBase

        const postSnapshot = await getDocs(postQuery);

        const data = postSnapshot.docs.map((document) => {
            const { images } = document.data();
            return {
                id: document.id,
                images: Array.isArray(images) ? images : [], // images가 배열인지 확인 후 반환
            };
        });

        const lastVisible = postSnapshot.docs.at(-1); // 마지막 문서

        // console.error(data, '보내는 인자')

        return NextResponse.json(
            {
                imageData: data,
                nextPage: lastVisible
                    ? [lastVisible.data().notice, lastVisible.data().createAt as Timestamp] // 정렬 필드 값 배열로 반환
                    : null,
            }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('댓글 데이터 반환 실패:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};