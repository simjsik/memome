import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import { adminAuth, adminDb } from "../DB/firebaseAdminConfig";
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from "crypto";
import { Timestamp } from "firebase-admin/firestore";

const router = express.Router();

const SECRET = process.env.JWT_SECRET;
const CSRF_SECRET = process.env.CSRF_SECRET;
const ACCESS_EXPIRES_MS = 60 * 60 * 1000;
const REFRESH_EXPIRES_DAYS = 30;
const REFRESH_MAX_AGE_MS = REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

export interface newUser {
    displayName: string | null;
    photoURL: string;
    userId: string;
}

router.post('/login', async (req: Request, res: Response) => {
    const clientOrigin = req.headers["project-host"] || req.headers.origin;
    const isProduction = clientOrigin?.includes("memome-delta.vercel.app");

    try {
        const { idToken } = req.body;

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken) {
            return res.status(401).json({ mseaage: '계정 토큰이 올바르지 않습니다' });
        }

        const uid = decodedToken.uid;
        const hasGuest = decodedToken.roles?.guest === true;
        const admin = decodedToken.roles?.admin === true;

        const userData: newUser = await adminDb.runTransaction<newUser>(async (tx) => {
            const userRef = hasGuest ?
                adminDb.doc(`guests/${uid}`) :
                adminDb.doc(`users/${uid}`);

            const userSnapshot = await tx.get(userRef);
            const userDoc = userSnapshot.data();

            let user: newUser = {
                displayName: userDoc?.displayName,
                photoURL: userDoc?.photoURL,
                userId: userDoc?.userId,
            };

            if (!userSnapshot.exists) {
                const randomName = hasGuest ?
                    `Guest-${Math.random().toString(36).substring(2, 10)}` :
                    `user-${Math.random().toString(36).substring(2, 10)}`;

                user = {
                    displayName: randomName,
                    photoURL:
                        "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg",
                    userId: uid,
                };

                tx.set(userRef, user);
            }
            return user;
        });

        if (!SECRET || !CSRF_SECRET) {
            console.error("JWT 비밀 키 확인 불가");
            return res.status(401).json({ message: "JWT 비밀 키 확인 불가" });
        }

        const jti = randomBytes(16).toString('hex');

        const payload = { uid, jti };

        const userToken = jwt.sign({ ...payload, admin, hasGuest }, SECRET, { expiresIn: '1h' });
        const csrfToken = jwt.sign(
            { ...payload, nonce: randomBytes(32).toString("hex"), type: 'csrf' },
            CSRF_SECRET,
            { expiresIn: '1h' },
        );

        const refreshId = randomBytes(32).toString('hex');
        const refreshHash =
            createHash('sha256').update(refreshId).digest('hex');

        const sessionId = randomBytes(32).toString('hex');
        const sessionHash =
            createHash('sha256').update(sessionId).digest('hex');

        const refreshDocRef =
            adminDb.doc(`refreshTokens/${uid}/session/${sessionHash}`);
        const sessionDocRef =
            adminDb.doc(`sessions/${sessionHash}`);

        await adminDb.runTransaction(async (tx) => {
            const now = Timestamp.now();
            const expiresAt = Timestamp.fromMillis(Date.now() + REFRESH_MAX_AGE_MS);

            tx.set(refreshDocRef, {
                uid,
                createdAt: now,
                lastAt: now,
                currentHash: refreshHash,
                prevHash: null,
                expiresAt,
                revoked: false,
                userAgent: req.headers['user-agent'] ?? null,
                ip: (req.headers['x-forwarded-for'] ??
                    req.socket.remoteAddress) as string | undefined,
            }, { merge: true });

            tx.set(sessionDocRef, {
                uid,
                sessionHash,
                expiresAt,
                createdAt: now,
                guest: hasGuest,
                revoked: false,
                lastAt: now,
            }, { merge: true });
        });

        const refreshCsrfToken = jwt.sign(
            {
                ...payload,
                sid: sessionHash,
                nonce: randomBytes(32).toString("hex"),
                type: 'refresh',
            },
            CSRF_SECRET,
            { expiresIn: '30d' },
        );

        const cookieUser = {
            httpOnly: true,
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: ACCESS_EXPIRES_MS,
        };

        const cookieCsrf = {
            httpOnly: false,
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: ACCESS_EXPIRES_MS,
        };

        const cookieRefreshCsrf = {
            httpOnly: false,
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: REFRESH_MAX_AGE_MS,
        };

        const cookieRefresh = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: REFRESH_MAX_AGE_MS,
        };

        const cookieSession = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: REFRESH_MAX_AGE_MS,
        };

        return res
            .cookie("userToken", userToken, cookieUser)
            .cookie("csrfToken", csrfToken, cookieCsrf)
            .cookie("refreshToken", refreshId, cookieRefresh)
            .cookie("refreshCsrfToken", refreshCsrfToken, cookieRefreshCsrf)
            .cookie("session", sessionId, cookieSession)
            .status(200)
            .json({
                message: "로그인 성공.",
                userData,
            });
    } catch (error) {
        console.error("로그인 실패:", error);
        if (error === "auth/user-not-found") {
            console.error(error);
            return res.status(404).json({ message: "유저 확인 불가" });
        } else if (error === "auth/wrong-password") {
            console.error(error);
            return res.status(400).json({ message: "잘못된 비밀번호" });
        }
        return res.status(500).json({ message: "로그인 시도 실패" });
    }
});

export default router;
