import { randomBytes } from "crypto";
import redisClient from "../../utils/redisClient";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// CSRF 토큰 생성 API
export async function GET() {
    const csrfToken = randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 3600 * 1000; // 1시간 후 만료

    // Redis에 CSRF 토큰 저장
    await redisClient.setEx(csrfToken, 3600, expiresAt.toString()); // "EX"는 만료 시간을 설정합니다.

    const response = NextResponse.json({ csrfToken });
    response.cookies.set("csrfToken", csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 3600 * 1000, // 1시간
    });

    return response;
}

export function generateJwt(uid: string, role: number): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign({ uid: uid, role: role }, secret, { expiresIn: "1h" });
}

