import express from "express";
import {Request, Response} from "express";
import {adminAuth} from "../DB/firebaseAdminConfig";
import redisClient, {
    authenticateUser, sessionExists,
} from "../utils/redisClient";
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/validate', async (req: Request, res: Response) => {
    try {
        const {idToken, uid} = await req.body;

        const authToken = req.cookies.authToken;
        const userToken = req.cookies.userToken;
        const csrfToken = req.cookies.csrfToken;

        if (!idToken && !uid) {
            return res.status(403).json({message: "토큰 및 UID가 누락되었습니다."});
        }

        if (idToken) { // 로그인 시 ID 토큰 검증 용
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            if (!decodedToken) {
                return res.status(403).json({
                     message: "ID 토큰이 유효하지 않거나 만료되었습니다.",
                    });
            }
        }

        if (uid) { // 로그인 후 유저 검증 용
            if (!authToken) {
                return res.status(403).json({message: "ID 토큰이 누락 되었습니다."});
            }

            const decodedToken = await adminAuth.verifyIdToken(authToken);

            if (!decodedToken) {
                return res.status(403).json({
                    message: "ID 토큰이 유효하지 않거나 만료되었습니다.",
                });
            }

            if (!userToken) {
                return res.status(403).json({message: "유저 토큰이 누락되었습니다."});
            }

            if (!await authenticateUser(userToken)) {
                return res.status(403).json({message: "유저 토큰이 유효하지 않습니다."});
            }

            // UID를 기반으로 Redis에서 세션 조회
            try {
                const userData = await sessionExists(
                    decodedToken.uid
                ); // Redis에서 세션 가져오기

                if (!userData) {
                    return res.status(403).json({
                        message: "유저 세션이 만료되었거나 유효하지 않습니다.",
                    });
                }
            } catch (err) {
                console.error("Redis 세션 조회 실패:", err);
                return res.status(403).json({
                    message: "유저 세션이 만료되었거나 유효하지 않습니다.",
                });
            }
        }

        if (csrfToken) {
            // Redis에서 토큰의 만료 시간 가져오기
            const expiresAt = await redisClient.get(csrfToken);

            // 토큰이 존재하지 않거나 만료된 경우
            if (!expiresAt || Date.now() > Number(expiresAt)) {
                console.log("CSRF 토큰 만료됨.");

                // 만료된 토큰 삭제
                await redisClient.del(csrfToken);

                return res.status(403).json({
                    message: "CSRF 토큰이 유효하지 않거나 만료되었습니다.",

                });
            }
        }

        const response = res.status(200).json({message: "유저 검증 확인"});

        // 추가적인 헤더 설정
        response.set("Access-Control-Allow-Credentials", "true");
        response.set("Access-Control-Allow-Origin", "http://localhost:3000");
        response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.set("Access-Control-Allow-Headers", "Content-Type");

        return response;
    } catch (error) {
        console.error("토큰 인증 실패:", error);
        return res.status(500).json({message: "토큰 인증 실패"});
    }
});

export default router;
