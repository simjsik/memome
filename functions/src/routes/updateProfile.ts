import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { adminAuth, adminDb } from "../DB/firebaseAdminConfig";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/updateProfile', async (req: Request, res: Response) => {
    try {
        const { image, name } = req.body;
        const user = req.get('x-user-uid');

        if (!user) {
            return res.status(403).json({ error: '유저가 없습니다' });
        }

        const docRef = adminDb.doc(`users/${user}`);
        const userSnapshot = await docRef.get();
        const userData = userSnapshot.data();

        if (!userData) {
            return res.status(403).json({ message: "유저 정보가 존재하지 않습니다." });
        }

        // Firebase Authentication의 프로필 업데이트
        await adminAuth.updateUser(user, {
            displayName: name,
            photoURL: image || userData.photoURL,
        });

        // 업데이트한 프로필 Firestore에 저장
        await docRef.update(
            {
                displayName: name,
                photoURL: image || userData.photoURL,
            },
        );

        return res.status(200).json({ message: "프로필 업데이트 성공" });
    } catch (error) {
        console.error('프로필 사진 업로드에 실패: ' + error);
        return res.status(500).json({ message: "프로필 사진 업로드에 실패" });
    }
});

export default router;
