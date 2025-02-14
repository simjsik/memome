import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { getSession } from "@/app/utils/redisClient";

export async function GET(req: NextRequest) {
    try {
        // 쿠키에서 authToken 가져오기
        const authToken = req.cookies.get("authToken")?.value;
        const userToken = req.cookies.get("userToken")?.value;
        const csrfToken = req.cookies.get("csrfToken")?.value;
        const hasGuest = req.cookies.get("hasGuest")?.value;

        if (!authToken) {
            return NextResponse.json({ message: "계정 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!userToken) {
            return NextResponse.json({ message: "유저 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!hasGuest) {
            return NextResponse.json({ message: "게스트 유저 정보가 유효하지 않습니다." }, { status: 403 });
        }

        let decodedToken; // Firebase 또는 Google에서 디코드된 토큰
        let userData;     // Redis에서 가져온 유저 데이터

        // 서버로 ID 토큰 검증을 위해 전송
        const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
            method: "POST",
            // 이미 토큰을 가져왔으니 여기선 필요 없음!
            body: JSON.stringify({ idToken: authToken, csrfToken }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Server-to-server error:", errorData.message);
            return NextResponse.json({ message: "토큰 인증 실패." }, { status: 403 });
        }

        decodedToken = await adminAuth.verifyIdToken(authToken); // Firebase 토큰 검증

        // UID를 기반으로 Redis에서 세션 조회
        userData = await getSession(decodedToken.uid); // Redis에서 세션 가져오기
        if (!userData) {
            return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
        }

        // 사용자 정보 반환
        return NextResponse.json({
            message: "자동 로그인 성공",
            user: {
                uid: decodedToken.uid,
                email: userData.email,
                displayName: userData.name || "Anonymous",
                photoURL: userData.photo || null,
            },
            hasGuest: hasGuest
        });
    } catch (error) {
        console.error("Auto-login token validation failed:", error);
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }
}
