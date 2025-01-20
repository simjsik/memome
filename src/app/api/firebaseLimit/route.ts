import { getFirestore } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const db = getFirestore();

export async function POST(req: NextRequest,) {
    const userId = req.headers.get('user-id');
    const hasGuest = req.cookies.get("hasGuest")?.value;

    if (!userId) {
        return NextResponse.json({ error: '유저가 없습니다.' }, { status: 401 });
    }
    const limitCount = hasGuest ? 50 : 100
    const currentTime = new Date();
    const today = currentTime.toISOString().split('T')[0] // 오늘 날짜

    try {
        const userDocRef = db.collection('userUsage').doc(userId);  // Firestore에서 문서 참조 얻기
        const userDocSnap = await userDocRef.get();  // 문서 읽기
        const userDoc = userDocSnap.data() as { readCount: number, lastUpdate: string };  // 문서 읽기

        if (!userDocSnap.exists) {
            // 유저가 처음 요청 시
            await userDocRef.set({ readCount: 0, lastUpdate: today });
        } else {
            const { readCount, lastUpdate } = userDoc;

            if (lastUpdate != today) {
                // 날짜가 변하면 카운트 초기화
                await userDocRef.set({
                    readCount: 0,
                    lastUpdate: today,
                })

            } else if (readCount >= limitCount) {
                // 사용량 초과
                return NextResponse.json({ error: 'Usage limit exceeded' }, { status: 403 });
            } else {
                // 카운트 증가
                await userDocRef.update({
                    readCount: readCount + 1,
                });
            }
        }

        return NextResponse.json({ message: '요청 허용' });
    } catch (error) {
        console.error('사용량 제한 처리 중 오류:', error);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}