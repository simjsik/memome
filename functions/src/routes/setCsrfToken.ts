import {Request, Response, Router} from "express";
import {randomBytes} from "crypto";
import {adminDb} from "../DB/firebaseAdminConfig";

const router = Router();

// CSRF 토큰 생성 API
router.get('/csrf', async (req : Request, res: Response) => {
    try {
        const {uid} = await req.body;
        console.log(uid, '유저 UID ( Csrf API )');

        const csrfToken = randomBytes(32).toString("hex");

            // Firestore에 CSRF 토큰 저장 (유효기간 24시간)
        await adminDb.collection("csrfTokens").doc(uid).set({
            csrfToken,
            uid,
            expiresAt: Date.now() + 3600 * 24000, // 1시간 후 만료
        });

        res.cookie("csrfToken", csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 3600 * 24000, // 1시간
        });

        return res.send({csrfToken});
    } catch (error) {
        return res.status(500).json({message: "CSRF 토큰 발급 실패", error});
    }
});

export default router;
