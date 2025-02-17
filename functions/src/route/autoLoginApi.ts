import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { adminAuth } from "../DB/firebaseAdminConfig";
import { getSession } from "../utils/redisClient";

const express = require('express');
const router = express.Router();
const app = express();
app.use(cookieParser());

router.get('/autoLogin', async (req: Request, res: Response) => {
    try {
        // 쿠키에서 authToken 가져오기
        const authToken = req.cookies.authToken;
        const userToken = req.cookies.userToken;
        const hasGuest = req.cookies.hasGuest;

        if (!authToken) {
            return res.status(403).json({ message: "계정 토큰이 존재하지 않습니다." });
        }

        if (!userToken) {
            return res.status(403).json({ message: "유저 토큰이 존재하지 않습니다." });
        }

        if (!hasGuest) {
            return res.status(403).json({ message: "게스트 유저 정보가 유효하지 않습니다." });
        }

        let decodedToken; // Firebase 또는 Google에서 디코드된 토큰
        let userData;     // Redis에서 가져온 유저 데이터

        // 서버로 ID 토큰 검증을 위해 전송
        const tokenResponse = await fetch('https://<region>-<project-id>.cloudfunctions.net/api/validate', {
            method: "POST",
            // 이미 토큰을 가져왔으니 여기선 필요 없음!
            body: JSON.stringify({ idToken: authToken }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("토큰 인증 실패:", errorData.message);
            return res.status(403).json({ message: "토큰 인증 실패." });
        }

        decodedToken = await adminAuth.verifyIdToken(authToken); // Firebase 토큰 검증

        // UID를 기반으로 Redis에서 세션 조회
        userData = await getSession(decodedToken.uid); // Redis에서 세션 가져오기
        if (!userData) {
            return res.status(403).json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." });
        }

        // 사용자 정보 반환
        return res.status(200).json({
            message: "자동 로그인 성공",
            user: {
                uid: decodedToken.uid,
                email: userData.email,
                displayName: userData.name || "Anonymous",
                photoURL: userData.photo || null,
            },
            hasGuest: hasGuest
        });
    } catch (error) {
        console.error("자동 로그인 시도 실패. ", error);
        return res.status(403).json({ message: "자동 로그인 시도에 실패 했습니다." });
    }
});

export default router;
