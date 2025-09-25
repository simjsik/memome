import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import {createHash} from "crypto";
import {adminDb} from "../DB/firebaseAdminConfig";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/logout', async (req: Request, res: Response) => {
    const clientOrigin = req.headers["Project-Host"] || req.headers.origin;
    const isProduction = clientOrigin?.includes("memome-delta.vercel.app");

    try {
        const sessionId = req.cookies.session;

        const cookieOptions = {
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
        };

        if (!sessionId) {
            res.clearCookie("csrfToken", cookieOptions);
            res.clearCookie("userToken", cookieOptions);
            res.clearCookie('refreshToken', cookieOptions);
            res.clearCookie('refreshCsrfToken', cookieOptions);
            res.clearCookie("session", cookieOptions);
            return res.status(200).json({success: true, mseaage: '로그아웃 완료'});
        }

        const sessionHash =
         createHash("sha256").update(sessionId).digest("hex");

        const sessionDocRef =
        adminDb.doc(`sessions/${sessionHash}`);

        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(sessionDocRef);
            if (!snap.exists) {
                return;
            }
            const session = snap.data()!;
            const uid = session.uid;
            if (!uid) {
                tx.delete(sessionDocRef);
                const idxRef = adminDb.doc(`sessions/${sessionHash}`);
                tx.delete(idxRef);
                return;
            }

            tx.delete(sessionDocRef);

            const tokenRef =
            adminDb.doc(`refreshTokens/${uid}/session/${sessionHash}`);
            tx.delete(tokenRef);

            const idxRef = adminDb.doc(`sessions/${sessionHash}`);
            tx.delete(idxRef);
        });

        // httpOnly 쿠키 삭제
        res.clearCookie("csrfToken");
        res.clearCookie("userToken");
        res.clearCookie('refreshToken');
        res.clearCookie('refreshCsrfToken');
        res.clearCookie("session");
        return res.status(200).json({success: true, mseaage: '로그아웃 완료'});
    } catch (error) {
        console.error("로그아웃 실패 : ", error);
        return res.status(500).json({
            success: false,
            message: "로그아웃에 실패 했습니다.",
         });
    }
});

export default router;
