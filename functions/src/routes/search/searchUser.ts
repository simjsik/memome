
import express, { Request, Response } from "express";
import { adminDb } from "../../DB/firebaseAdminConfig";

const router = express.Router();

router.post('/search/user', async (req: Request, res: Response) => {
    const { uid } = req.body;

    try {
        if (!uid) {
            console.error('유저 아이디를 찾을 수 없습니다.');
            return res.status(400).json({
                message: 'BR',
            });
        }

        const userRef = adminDb.doc(`users/${uid}`);

        const userSnap = await userRef.get();
        const userData = userSnap.data();
        if (!userData || !userSnap) {
            console.error('유저 문서를 찾을 수 없습니다.');
            return res.status(404).json({
                message: 'NF',
            });
        }

        const user = {
            displayName: userData.displayName,
            photoURL: userData.photoURL,
        };

        return res.status(200).json({
            message: '유저 정보 조회 성공',
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: '유저 정보 조회 실패',
        });
    }
});

export default router;
