import dotenv from "dotenv";
dotenv.config();
import express, {Request, Response} from "express";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";
import jwt from 'jsonwebtoken';
import {randomBytes} from "crypto";

const router = express.Router();

const SECRET = process.env.JWT_SECRET;
const CSRF_SECRET = process.env.CSRF_SECRET;
const ACCESS_EXPIRES_MS = 60 * 60 * 1000;

export interface newUser {
    displayName: string | null;
    photoURL: string;
    userId: string;
}

router.post('/login', async (req: Request, res: Response) => {
    const clientOrigin = req.headers["Project-Host"] || req.headers.origin;
    const isProduction = clientOrigin?.includes("memome-delta.vercel.app");

    try {
        const {idToken} = await req.body;

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken) {
            return res.status(401).json({message: "계정 토큰이 올바르지 않습니다."});
        }

        const uid = decodedToken.uid;
        const hasGuest = decodedToken.roles?.guest === true;

        const userRef = hasGuest ?
            adminDb.doc(`guests/${uid}`) :
            adminDb.doc(`users/${uid}`);

        const userSnapshot = await userRef.get();
        const userDoc = userSnapshot.data();

        let userData : newUser = {
            displayName: userDoc?.displayName,
            photoURL: userDoc?.photoURL,
            userId: userDoc?.userId,
        };

        if (!userSnapshot.exists) {
            const randomName = hasGuest ?
            `Guest-${Math.random().toString(36).substring(2, 10)}` :
            `user-${Math.random().toString(36).substring(2, 10)}`;

            userData = {
                displayName: randomName,
                photoURL: "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg",
                userId: uid,
            };

            await userRef.set(userData, {merge: true});
        }

        if (!SECRET || !CSRF_SECRET) {
            console.error("JWT 비밀 키 확인 불가");
            return res.status(401).json({message: "JWT 비밀 키 확인 불가."});
        }

        const jti = randomBytes(16).toString('hex');

        const payload = {uid, jti};

        const userToken = jwt.sign(payload, SECRET, {expiresIn: '1h'});
        const csrfToken = jwt.sign(
            {...payload, nonce: randomBytes(32).toString("hex")},
            CSRF_SECRET,
            {expiresIn: '1h'},
        );


        const cookieOptions = {
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: 3600 * 1000,
        };

        return res
        .cookie("csrfToken", csrfToken, {
            ...cookieOptions, httpOnly: false, maxAge: ACCESS_EXPIRES_MS,
        })
        .cookie("userToken", userToken, {
            ...cookieOptions, httpOnly: true, maxAge: ACCESS_EXPIRES_MS,
        })
        .status(200)
        .json({
            message: "로그인 성공.",
            userData,
        });
    } catch (error) {
        console.error("Login error:", error);
        if (error === "auth/user-not-found") {
            return res.status(404).json({message: "유저 확인 불가"});
        } else if (error === "auth/wrong-password") {
            return res.status(400).json({message: "잘못된 비밀번호"});
        }
        return res.status(500).json({message: "로그인 시도 실패"});
    }
});

export default router;
