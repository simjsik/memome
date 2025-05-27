import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/limit', async (req: Request, res: Response) => {
    const {uid} = req.body;
    const authToken = req.cookies.authToken;
    console.log(authToken?.slice(0, 8), uid, "유저 토큰 및 UID ( Validate API )");

    if (!uid) {
        return res.status(401).json({error: '유저가 없습니다.'});
    }

    const decodedToken = await adminAuth.verifyIdToken(authToken);

    if (!decodedToken) {
        console.log("유저 아이디 토큰 검증 실패.");
        return res.status(403).json({
            message: "ID 토큰이 유효하지 않거나 만료되었습니다.",
        });
    }

    const hasGuest = decodedToken.roles?.guest === true;

    let limitCount = 80;
    if (hasGuest) {
        limitCount = 40;
    }

    const currentTime = new Date();
    const today = currentTime.toISOString().split('T')[0]; // 오늘 날짜

    try {
        // Firestore에서 문서 참조 얻기
        const userDocRef = adminDb.doc(`userUsage/${uid}`);
        const userDocSnap = await userDocRef.get(); // 문서 읽기
        const userDoc = userDocSnap.data() as {
            readCount: number, lastUpdate: string
         }; // 문서 읽기

        if (!userDocSnap.exists) {
            // 유저가 처음 요청 시
            await userDocRef.set({readCount: 0, lastUpdate: today});
        } else {
            const {readCount, lastUpdate} = userDoc;

            if (lastUpdate != today) {
                // 날짜가 변하면 카운트 초기화
                await userDocRef.set({
                    readCount: 0,
                    lastUpdate: today,
                });
                console.log(readCount, limitCount, '초과 제한!');
            } else if (readCount >= limitCount) {
                console.log('초과 제한!');
                // 사용량 초과
                return res.status(403).json({error: '사용량이 초과되었습니다.'});
            } else {
                // 카운트 증가
                await userDocRef.update({
                    readCount: readCount + 1,
                });
            }
        }

        return res.status(200).json({message: '요청 허용'});
    } catch (error) {
        console.error('사용량 제한 처리 중 오류:', error);
        return res.status(500).json({error: '서버 오류'});
    }
});

export default router;
