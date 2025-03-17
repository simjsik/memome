import express, {Request, Response} from "express";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/validate', async (req: Request, res: Response) => {
    try {
        const {idToken, uid} = await req.body;
        console.log(idToken?.slice(0, 8), uid, "유저 토큰 및 UID ( Validate API )");
        const authToken = req.cookies.authToken;
        const csrfToken = req.cookies.csrfToken;
        const hasGuest = req.cookies.hasGuest;

        if (!idToken && (!uid && !csrfToken)) {
            console.log("유저 아이디 토큰 및 UID 누락 ( Validate API )");
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
            console.log("유저 아이디 UID 확인. 검증 진행 ( Validate API )");
            console.log(authToken?.slice(0, 8), "유저 ID 토큰 ( Validate API )");
            console.log(csrfToken?.slice(0, 8), "CSRF 토큰 ( Validate API )");
            if (!authToken) {
                console.log("유저 ID 토큰 누락. 검증 실패 ( Validate API )");
                return res.status(403).json({message: "유저 ID 토큰이 누락 되었습니다."});
            }
            if (!csrfToken) {
                console.log("CSRF 토큰 누락. 검증 실패 ( Validate API )");
                return res.status(403).json({message: "CSRF 토큰이 누락 되었습니다."});
            }

            const decodedToken = await adminAuth.verifyIdToken(authToken);

            if (!decodedToken) {
                console.log("ID 토큰 검증 실패 ( Validate API )");
                return res.status(403).json(
                    {message: "ID 토큰이 유효하지 않거나 만료되었습니다."}
                );
            }

            const userRef = hasGuest ?
            adminDb.collection('guests').doc(uid) :
            adminDb.collection('users').doc(uid);
            const userSnapshot = await userRef.get();
            const userData = userSnapshot.data();

            if (!userData) {
                console.log("유저 세션 검증 실패 ( Validate API )");
                return res.status(403).json({
                    message: "유저 세션이 만료되었거나 유효하지 않습니다.",
                });
            }

            if (csrfToken) {
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
                            headers: {"Content-Type": "application/json"},
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

        console.log("유저 검증 완료.");
        return res.status(200).json({message: "유저 검증 확인"});
    } catch (error) {
        console.error("토큰 인증 실패:", error);
        return res.status(500).json({message: "토큰 인증 실패"});
    }
});

export default router;
