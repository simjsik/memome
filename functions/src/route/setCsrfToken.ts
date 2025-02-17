import express from "express";
import cookieParser from "cookie-parser";
import {randomBytes} from "crypto";
import {Response} from "express";
import redisClient from "../utils/redisClient";

const router = express.Router();
const app = express();
app.use(cookieParser());

// CSRF 토큰 생성 API
router.get('/validate', async (res: Response) => {
    const csrfToken = randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 3600 * 1000; // 1시간 후 만료

    // Redis에 CSRF 토큰 저장
    await redisClient.setEx(
        csrfToken, 3600, expiresAt.toString()
    ); // "EX"는 만료 시간을 설정합니다.

    const response = res.status(200).json({csrfToken});

    res.cookie("csrfToken", csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 3600 * 1000, // 1시간
    });

    return response;
});

export default router;
