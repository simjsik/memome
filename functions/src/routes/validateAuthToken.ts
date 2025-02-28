import express, {Request, Response} from "express";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/validate', async (req: Request, res: Response) => {
    try {
        const {idToken, uid} = await req.body;
        console.log(idToken.slice(0, 8), "유저 아이디 토큰 ( Validate API )");
        const authToken = req.cookies.authToken;
        const csrfToken = req.cookies.csrfToken;

        if (!idToken && !uid) {
            console.log("유저 아이디 토큰 및 UID 누락");
            return res.status(403).json({message: "토큰 및 UID가 누락되었습니다."});
        }

        if (idToken) { // 로그인 시 ID 토큰 검증 용
            console.log("유저 아이디 토큰 확인. 검증 진행");
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            if (!decodedToken) {
                console.log("유저 아이디 토큰 검증 실패.");
                return res.status(403).json({
                     message: "ID 토큰이 유효하지 않거나 만료되었습니다.",
                    });
            }
        }

        if (uid) { // 로그인 후 유저 검증 용
            console.log("유저 아이디 UID 확인. 검증 진행");
            if (!authToken) {
                return res.status(403).json({message: "UID가 누락 되었습니다."});
            }

            const decodedToken = await adminAuth.verifyIdToken(authToken);

            if (!decodedToken) {
                return res.status(403).json(
                    {message: "ID 토큰이 유효하지 않거나 만료되었습니다."}
                );
            }

            const userRef = adminDb.collection('users').doc(uid);
            const userSnapshot = await userRef.get();
            const userData = userSnapshot.data();

            if (!userData) {
                return res.status(403).json({
                    message: "유저 세션이 만료되었거나 유효하지 않습니다.",
                });
            }

            if (csrfToken) {
                // Redis에서 토큰의 만료 시간 가져오기
                const csrfDoc = await
                adminDb.collection("csrfTokens").doc(uid).get();

                const csrfData = csrfDoc.data();

                if (!csrfDoc.data() || !csrfData) {
                    return res.status(403).json(
                        {message: "CSRF 토큰이 존재하지 않습니다."}
                    );
                }

                const expiresAt = csrfData.expiresAt;

                // 토큰이 존재하지 않거나 만료된 경우
                if (Date.now() > Number(expiresAt)) {
                    await adminDb.collection("csrfTokens").doc(uid).delete();
                    try {
                        const CsrfResponse = await fetch(
                            `${process.env.API_URL}/csrf`, {
                            method: "POST",
                            body: JSON.stringify({uid}),
                        });
                        if (!CsrfResponse.ok) {
                            return res.status(403).json(
                                {message: "CSRF 토큰 재발급 실패."}
                            );
                        }
                    } catch (error) {
                        return res.status(403).json(
                            {message: "CSRF 토큰 재발급 실패.", error}
                        );
                    }
                    console.log("CSRF 토큰 만료됨.");

                    return res.status(403).json({
                        message: "CSRF 토큰이 유효하지 않거나 만료되었습니다.",
                    });
                }
            }
        }

        const response = res.status(200).json({message: "유저 검증 확인"});

        return response;
    } catch (error) {
        console.error("토큰 인증 실패:", error);
        return res.status(500).json({message: "토큰 인증 실패"});
    }
});

export default router;
