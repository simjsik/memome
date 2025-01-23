import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { randomBytes } from "crypto";
import redisClient from "../../utils/redisClient";
import { NextResponse } from "next/server";

export async function validateCsrfToken(token: string) {
    if (!token) {
        console.log("CSRF 토큰 없음.");
        return false;
    }

    try {
        // Redis에서 토큰의 만료 시간 가져오기
        const expiresAt = await redisClient.get(token);

        // 토큰이 존재하지 않거나 만료된 경우
        if (!expiresAt || Date.now() > Number(expiresAt)) {
            console.log("CSRF 토큰 만료됨.");

            // 만료된 토큰 삭제
            await redisClient.del(token);

            return false;
        }

        console.log("CSRF 토큰 유효.");
        return true;
    } catch (error) {
        console.error("CSRF 검증 중 오류 발생:", error);
        return false;
    }
}

export async function validateIdToken(idToken: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (decodedToken) {
            return true;
        } else {
            console.error('ID 토큰 검증 실패')
            return false;
        }
    } catch (error) {
        console.error("ID 토큰 검증 실패:", error);
        return false; // 유효하지 않은 경우
    }
}

export async function validateGoogleToken(googleToken: string) {
    try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
        if (!response) {
            console.error('구글 토큰 검증 실패')
            return false;
        }
        const googleUser = await response.json();
        if (googleUser) {
            return true;
        } else {
            console.error('구글 토큰 검증 실패')
            return false;
        }
    } catch (error) {
        console.error("구글 토큰 검증 실패:", error);
        return false; // 유효하지 않은 경우
    }
}

// CSRF 토큰 저장을 위한 API
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
    const jwt = require('jsonwebtoken');

    return jwt.sign({ uid: uid, role: role }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

