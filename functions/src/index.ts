import * as dotenv from "dotenv";
dotenv.config();
import {onRequest} from "firebase-functions/v2/https";
import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import {randomBytes} from "crypto";
import redisClient from "./utils/redisClient";

const app = express();
app.use(express.json());
app.use(cookieParser());
const router = express.Router();

// CSRF 토큰 생성 API
router.get('/validate', async (req : Request, res: Response) => {
    try {
        const csrfToken = randomBytes(32).toString("hex");

        const expiresAt = Date.now() + 3600 * 1000; // 1시간 후 만료

        // Redis에 CSRF 토큰 저장
        await redisClient.setEx(
            csrfToken, 3600, expiresAt.toString()
        ); // "EX"는 만료 시간을 설정합니다.

        res.cookie("csrfToken", csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 3600 * 1000, // 1시간
        });

        return res.status(200).json({csrfToken});
    } catch (error) {
        return res.status(500).json({message: "CSRF 토큰 발급 실패", error});
    }
});

// Express 앱에 라우터를 마운트
app.use('/', router);

export const api = onRequest(app);
