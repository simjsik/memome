import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export default async function requestCheckLimit(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.headers['user-id'] as string;

    if (!userId) {
        return res.status(401).json({ error: '유저가 없습니다.' });
    }

    const currentTime = new Date();
    const today = currentTime.toISOString().split('T')[0] // 오늘 날짜

    try {
        const userDocRef = db.collection('userUsage').doc(userId);  // Firestore에서 문서 참조 얻기
        const userDocSnap = await userDocRef.get();  // 문서 읽기
        const userDoc = userDocSnap.data() as { readCount: number, lastUpdate: string };  // 문서 읽기

        if (!userDocSnap.exists) {
            // 유저가 처음 요청 시
            await userDocRef.set({ readCount: 1, lastUpdate: today });
        } else {
            const { readCount, lastUpdate } = userDoc;

            if (lastUpdate != today) {
                // 날짜가 변하면 카운트 초기화
                await userDocRef.set({
                    readCount: 1,
                    lastUpdate: today,
                })

            } else if (readCount >= 5000) {
                // 사용량 초과
                return res.status(429).json({ error: 'Usage limit exceeded' });
            } else {
                // 카운트 증가
                await userDocRef.update({
                    readCount: readCount + 1,
                });
            }
        }
        // --------------------------------------------------------------------

        return res.status(200).json({ message: '요청 허용' });
    } catch (error) {
        console.error('사용량 제한 처리 중 오류:', error);
        return res.status(500).json({ error: '서버 오류' });
    }
}