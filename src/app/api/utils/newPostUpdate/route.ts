import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";
import { validateIdToken } from "../../auth/validateCsrfToken/route";
import { authenticateUser, getSession } from "../redisClient";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, statusPath } = body;
        // 쿠키에서 authToken 가져오기
        const authToken = req.cookies.get("authToken")?.value;
        const userToken = req.cookies.get("userToken")?.value;

        let decodedToken: any; // Firebase 또는 Google에서 디코드된 토큰
        let userData: any;     // Redis에서 가져온 유저 데이터

        if (!authToken) {
            return NextResponse.json({ message: "계정 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!userToken) {
            return NextResponse.json({ message: "유저 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!authenticateUser(userToken)) {
            return NextResponse.json({ message: "유저 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        if (!validateIdToken(authToken)) {
            return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        try {
            decodedToken = await adminAuth.verifyIdToken(authToken); // Firebase 토큰 검증
        } catch (err) {
            console.error("ID 토큰 검증 실패:", err);
            return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        // UID를 기반으로 Redis에서 세션 조회
        try {
            userData = await getSession(decodedToken.uid); // Redis에서 세션 가져오기
            if (!userData) {
                return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
            }
        } catch (err) {
            console.error("Redis 세션 조회 실패:", err);
            return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
        }

        const docRef = adminDb.doc(`users/${userId}/${statusPath}`);
        await docRef.update({ hasUpdate: false });

        // 사용자 정보 반환
        return NextResponse.json({
            message: "업데이트 성공",
        });
    } catch (error) {
        console.error("Auto-login token validation failed:", error);
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }
}
