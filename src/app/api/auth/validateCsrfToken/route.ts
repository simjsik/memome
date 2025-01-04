import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

const csrfTokens = new Map(); // In-memory storage for CSRF tokens

export async function GET() {
    const csrfToken = randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1시간 후 만료

    csrfTokens.set(csrfToken, expiresAt);

    const response = NextResponse.json({ csrfToken });
    response.cookies.set("csrfToken", csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60, // 1시간
    });

    return response;
}

export function validateCsrfToken(token: string) {
    const expiresAt = csrfTokens.get(token);
    console.log('CSRF 토큰 검증 중')
    if (!expiresAt || Date.now() > expiresAt) {
        csrfTokens.delete(token); // 만료된 토큰 삭제
        console.log('CSRF 토큰 만료 삭제', Date.now() > expiresAt)
        return false;
    }
    csrfTokens.delete(token); // 사용한 토큰 삭제
    console.log('CSRF 토큰 확인.')
    return true;
}