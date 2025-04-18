import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import {adminDb} from "../DB/firebaseAdminConfig";

const router = express.Router();
const app = express();
app.use(cookieParser());

export interface newUser {
    displayName: string | null;
    photoURL: string;
    userId: string;
}

router.post('/saveUser', async (req: Request, res: Response) => {
    const {uid, displayName, hasGuest} = req.body;

    try {
        const userRef = hasGuest ?
         adminDb.doc(`guests/${uid}`) :
         adminDb.doc(`users/${uid}`);

        const randomName = hasGuest ?
         `Guest-${Math.random().toString(36).substring(2, 10)}` :
         `user-${Math.random().toString(36).substring(2, 10)}`;

        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            const userData: newUser = {
                displayName: displayName || randomName,
                photoURL: "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744861940/%ED%94%84%EB%A1%9C%ED%95%84%EC%9A%A9_grt1en.png",
                userId: uid,
            };

            await userRef.set(userData);
        }

        return res.status(200).json({message: "유저 정보 저장"});
    } catch (error) {
        if (error) {
            return res.status(403).json({message: "유저 정보 저장 실패" + error});
        }
        return res.status(403).json({message: "유저 정보 저장 실패"});
    }
});

export default router;
