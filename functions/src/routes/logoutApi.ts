import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import {createHash} from "crypto";
import {adminDb} from "../DB/firebaseAdminConfig";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/logout', async (req: Request, res: Response) => {
    try {
        const sessionId = req.cookies.get('sessionID')?.value;

        if (!sessionId) {
            res.clearCookie("csrfToken");
            res.clearCookie("userToken");
            res.clearCookie('refreshToken');
            res.clearCookie("sessionID");
            return res.status(200).json({message: '로그아웃 처리 완료'});
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
            const uid = session.uid as string;
            if (!uid) {
                tx.delete(sessionDocRef);
                const idxRef = adminDb.doc(`sessionIndex/${sessionHash}`);
                tx.delete(idxRef);
                return;
            }

            tx.delete(sessionDocRef);

            const tokenRef =
            adminDb.doc(`refreshTokens/${uid}/sessions/${sessionHash}`);
            tx.delete(tokenRef);

            const idxRef = adminDb.doc(`sessionIndex/${sessionHash}`);
            tx.delete(idxRef);
            });

        // httpOnly 쿠키 삭제
        res.clearCookie("csrfToken");
        res.clearCookie("userToken");
        res.clearCookie('refreshToken');
        res.clearCookie("sessionID");
        return res.status(200).json({success: true});
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({
            success: false,
            message: error || "Logout failed",
         });
    }
});

export default router;
