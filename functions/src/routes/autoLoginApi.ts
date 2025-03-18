import dotenv from "dotenv";
dotenv.config();
import express, {Request, Response, Router} from "express";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";
import cookieParser from "cookie-parser";
interface userData {
    name: string;
    photo: string;
    uid: string;
}

const router = Router();
const app = express();
app.use(cookieParser());

const API_URL = process.env.API_URL;

router.get('/autoLogin', async (req: Request, res: Response) => {
    try {
        // 쿠키에서 authToken 가져오기
        const authToken = req.cookies.authToken;
        const hasGuest = req.cookies.hasGuest;

        console.log(authToken?.slice(0, 8), '유저 ID 토큰 ( Auto Login API )');

        if (!authToken) {
            return res.status(403).json({message: "계정 토큰이 존재하지 않습니다."});
        }

        if (!hasGuest) {
            return res.status(403).json({message: "게스트 유저 정보가 유효하지 않습니다."});
        }

        // 서버로 ID 토큰 검증을 위해 전송
        const tokenResponse = await fetch(`${API_URL}/validate`, {
            method: "POST",
            // 이미 토큰을 가져왔으니 여기선 필요 없음!
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({idToken: authToken}),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("토큰 인증 실패:", errorData.message);
            return res.status(403).json({message: "토큰 인증 실패."});
        }

        const decodedToken = await adminAuth.verifyIdToken(
            authToken
        ); // Firebase 토큰 검증

        // UID를 기반으로 Redis에서 세션 조회
        const userRef = adminDb.collection('users').doc(decodedToken.uid);
        const userSnapshot = await userRef.get();
        const userData = userSnapshot.data();

        if (!userData) {
            return res.status(403).json({message: "유저 정보가 존재하지 않습니다."});
        }

        console.log(
                'userId', decodedToken.uid,
                'displayName', userData.displayName || "Anonymous",
                'photoURL', userData.photoURL || null,
        );
        // 사용자 정보 반환
        return res.status(200).json({
            message: "자동 로그인 성공",
            user: {
                uid: decodedToken.uid,
                name: userData.displayName || "Anonymous",
                photo: userData.photoURL || null,
            } as userData,
            hasGuest: hasGuest,
        });
    } catch (error) {
        console.error("자동 로그인 시도 실패. ", error);
        return res.status(403).json({message: "자동 로그인 시도에 실패 했습니다."});
    }
});

export default router;
