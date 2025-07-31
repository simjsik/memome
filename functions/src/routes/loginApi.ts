import dotenv from "dotenv";
dotenv.config();
import express, {Request, Response} from "express";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";
import jwt from 'jsonwebtoken';
import {randomBytes} from "crypto";

const router = express.Router();

const API_URL = process.env.API_URL;
const secret = process.env.JWT_SECRET;

router.post('/login', async (req: Request, res: Response) => {
    try {
        const {idToken} = await req.body;

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken) {
            return res.status(401).json({message: "계정 토큰이 올바르지 않습니다."});
        }

        const uid = decodedToken.uid;
        let userSession = null;
        const hasGuest = decodedToken.roles?.guest === true;

        const userRef = hasGuest ?
            adminDb.doc(`guests/${uid}`) :
            adminDb.doc(`users/${uid}`);

        const userSnapshot = await userRef.get();
        const userData = userSnapshot.data();

        console.log(userData, !userSnapshot.exists, '유저 정보');

        if (userSnapshot.exists) {
            userSession = {
                uid: uid,
                name: userData?.displayName || "",
                photo: userData?.photoURL || "",
            };
        } else {
            const saveUserResponse = await fetch(`${API_URL}/saveUser`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    uid,
                    hasGuest: true,
                }),
            });

            if (!saveUserResponse?.ok) {
                const errorData = await saveUserResponse?.json();
                console.error("유저 저장 실패:", errorData.message);
                return res.status(401).json({message: "유저 저장 실패."});
            }

            const response = await saveUserResponse.json();

            console.log(response.userData, '게스트 유저 정보');

            if (saveUserResponse.status === 200) {
                userSession = response.userData;
            }
        }

        const tokenResponse = await fetch(`${API_URL}/validate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({idToken}),
        });

        if (!tokenResponse?.ok) {
            const errorData = await tokenResponse?.json();
            console.error("토큰 인증 실패:", errorData.message);
            return res.status(401).json({message: "토큰 인증 실패."});
        }

        if (!secret) {
            console.error("JWT 비밀 키 확인 불가");
            return res.status(401).json({message: "JWT 비밀 키 확인 불가."});
        }

        if (!userSession) {
            return res.status(400).json({message: "유저 정보 불러오기 실패"});
        }

        const userToken = jwt.sign({uid}, secret, {expiresIn: "1h"});

        const csrfToken = randomBytes(32).toString("hex");

        const clientOrigin = req.headers["Project-Host"] || req.headers.origin;
        const isProduction = clientOrigin?.includes("memome-delta.vercel.app");

        const cookieOptions = {
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: 3600 * 1000,
        };

        return res
        .cookie("csrfToken", csrfToken, cookieOptions)
        .cookie("authToken", idToken, cookieOptions)
        .cookie("userToken", userToken, cookieOptions)
        .status(200)
        .json({
            message: "로그인 성공.",
            uid,
            user: userSession,
        });
    } catch (error) {
        console.error("Login error:", error);
        if (error === "auth/user-not-found") {
            return res.status(404).json({message: "User not found"});
        } else if (error === "auth/wrong-password") {
            return res.status(400).json({message: "Incorrect password"});
        }
        return res.status(500).json({message: "Login failed"});
    }
});

export default router;
