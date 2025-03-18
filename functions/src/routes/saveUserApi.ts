import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import {adminDb} from "../DB/firebaseAdminConfig";

const router = express.Router();
const app = express();
app.use(cookieParser());

export interface newUser {
    displayName: string | null;
    photoURL: string | null;
    userId: string;
}

router.post('/saveUser', async (req: Request, res: Response) => {
    const {uid, displayName, photoURL, hasGuest} = req.body;

    try {
        const userRef = hasGuest ?
         adminDb.doc(`guests/${uid}`) :
         adminDb.doc(`users/${uid}`);

        const randomName = hasGuest ?
         `Guest-${Math.random().toString(36).substring(2, 10)}` :
         `user-${Math.random().toString(36).substring(2, 10)}`;

        const userSnapshot = await userRef.get();
        console.log(randomName, '유저 정보 저장 API');
        if (!userSnapshot.exists) {
            const userData: newUser = {
                displayName: displayName || randomName,
                photoURL: photoURL || "",
                userId: uid,
            };

            await userRef.set(userData);
            console.log(`New Firebase user created: ${uid}`);
        }
        console.log(userSnapshot.exists, '유저 정보 저장 API');

        return res.status(200).json({message: "유저 정보 저장"});
    } catch (error) {
        if (error) {
            return res.status(403).json({message: "유저 정보 저장 실패" + error});
        }
        return res.status(403).json({message: "유저 정보 저장 실패"});
    }
});

export default router;
