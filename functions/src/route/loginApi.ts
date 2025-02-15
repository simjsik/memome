import { Request, Response } from "express";
import { adminAuth, adminDb } from "../DB/firebaseAdminConfig";
import { generateJwt, saveGuestSession, saveSession, sessionExists } from "../utils/redisClient";
import cookieParser from 'cookie-parser';

const express = require('express');
const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { idToken, role, hasGuest, guestUid } = await req.body;
        const randomName = `Guest-${Math.random().toString(36).substring(2, 6)}`;

        let decodedToken
        let uid;
        let userSession;
        let tokenResponse;

        if (guestUid) {
            if (!idToken) return res.status(403).json({ message: "게스트 토큰 누락" });
            decodedToken = await adminAuth.verifyIdToken(idToken);
            uid = decodedToken.uid;

            const guestDocRef = adminDb.doc(`guests/${guestUid}`);
            const guestDoc = await guestDocRef.get();
            const guestSessions = await sessionExists(guestUid)

            if (!guestSessions) {
                await guestDocRef.delete();
                console.log('게스트 세션 없음', guestSessions)
            }

            if (!guestDoc.exists) {
                const customToken = await adminAuth.createCustomToken(uid);

                const saveUserResponse = await fetch('http://localhost:3000/api/utils/saveUserProfile', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid, displayName: randomName, token: customToken }),
                })

                if (!saveUserResponse.ok) {
                    const errorData = await saveUserResponse.json();
                    throw new Error(`${saveUserResponse.status}: ${errorData.error}`);
                }

            } else {
                const idToken = await guestUid.getIdToken();
                if (!idToken) {
                    return res.status(403).json({ message: "게스트 토큰이 유효하지 않습니다." });
                }

                decodedToken = await adminAuth.verifyIdToken(idToken);
                if (!decodedToken) {
                    return res.status(403).json({ message: "게스트 계정이 올바르지 않습니다." });
                }

                uid = decodedToken.uid
            }

            tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
                method: "POST",
                body: JSON.stringify({ idToken }),
            });
        } else {
            decodedToken = await adminAuth.verifyIdToken(idToken);
            if (!decodedToken) {
                return res.status(403).json({ message: "계정 토큰이 올바르지 않습니다." });
            }

            uid = decodedToken.uid

            tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
                method: "POST",
                body: JSON.stringify({ idToken }),
            });
        }

        if (!tokenResponse?.ok) {
            const errorData = await tokenResponse?.json();
            console.error("Server-to-server error:", errorData.message);
            return res.status(403).json({ message: "토큰 인증 실패." });
        }

        if (hasGuest) {
            userSession = {
                uid: uid,
                name: decodedToken.name || randomName,
                photo: decodedToken.picture || "",
                email: decodedToken.email || "",
                role: role
            };
        } else {
            userSession = {
                uid: uid,
                name: decodedToken.name || "",
                photo: decodedToken.picture || "",
                email: decodedToken.email || "",
                role: role
            };
        }

        const UID = generateJwt(uid, role);

        const response = res.status(200).json({ message: "로그인 성공.", uid, user: userSession });

        if (hasGuest) {
            await saveGuestSession(uid, userSession);
        } else {
            await saveSession(uid, userSession);
        }

        res.cookie("authToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        res.cookie("userToken", UID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        res.cookie("hasGuest", hasGuest, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        // 추가적인 헤더 설정
        res.set("Access-Control-Allow-Credentials", "true");
        res.set("Access-Control-Allow-Origin", "http://localhost:3000");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");

        return response;
        // 커스텀 토큰 발급
    } catch (error) {
        console.error("Login error:", error);
        if (error === "auth/user-not-found") {
            return res.status(404).json({ message: "User not found" });
        } else if (error === "auth/wrong-password") {
            return res.status(401).json({ message: "Incorrect password" });
        }
        return res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;