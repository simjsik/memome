import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { adminDb } from "../DB/firebaseAdminConfig";

const express = require('express');
const router = express.Router();
const app = express();
app.use(cookieParser());

export interface newUser {
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
    uid: string;
    token?: string;
}

router.post('/saveUser', async (req: Request, res: Response) => {
    const { uid, displayName, email, token, photoURL } = req.body;
    let randomName
    let userRef
    try {
        userRef = adminDb.doc(`users/${uid}`);
        randomName = `user-${Math.random().toString(36).substring(2, 10)}`;

        if (token) {
            userRef = adminDb.doc(`guests/${uid}`);
            randomName = `Guest-${Math.random().toString(36).substring(2, 10)}`;
        }

        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {

            const userData: newUser = {
                displayName: displayName || randomName,
                photoURL: photoURL || "",
                email: email,
                uid: uid,
            };

            if (token) {
                userData.token = token;
            }

            await userRef.set(userData);
            console.log(`New Firebase user created: ${uid}`);
        }

        return res.status(200).json({ message: "유저 정보 저장" });
    } catch (error) {
        if (error) {
            return res.status(403).json({ message: "유저 정보 저장 실패" + error });
        }
        return res.status(403).json({ message: "유저 정보 저장 실패" });
    }
});

export default router;
