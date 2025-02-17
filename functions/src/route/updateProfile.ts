import express from "express";
import cookieParser from "cookie-parser";
import {Request, Response} from "express";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";
import {getSession, updateSession} from "../utils/redisClient";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/saveUser', async (req: Request, res: Response) => {
    try {
        const {image, name, uid} = req.body;

        const userData = await getSession(uid);
        if (!userData) {
            return res.status(403).json({message: "유저 세션 정보가 존재하지 않습니다."});
        }

        // Firebase Authentication의 프로필 업데이트
        await adminAuth.updateUser(uid, {
            displayName: name,
            photoURL: image || userData.photo,
        });

        // 업데이트한 프로필 Firestore에 저장
        const docRef = adminDb.doc(`users/${uid}`);
        await docRef.update(
            {
                displayName: name,
                photoURL: image || userData.photo,
            },
        );

        const userSession = {
            uid: uid,
            name: name,
            photo: image || userData.photo,
            email: userData.email,
            role: userData.role,
        };

        updateSession(uid, userSession);
        // 사용자 정보 반환
        return res.status(200).json({message: "프로필 업데이트 성공"});
    } catch (error) {
        console.error('프로필 사진 업로드에 실패: ' + error);
        return res.status(500).json({message: "프로필 사진 업로드에 실패"});
    }
});

export default router;
