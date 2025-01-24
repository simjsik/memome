import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, deleteSession } from "../redisClient";
import { validateIdToken } from "../../auth/validateCsrfToken/route";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";

export async function POST(req: NextRequest) {
    try {
        const userToken = req.cookies.get("userToken")?.value;
        const authToken = req.cookies.get("authToken")?.value;

        let decodedToken: any; // Firebase 또는 Google에서 디코드된 토큰

        if (!authToken) {
            return NextResponse.json({ message: "계정 토큰이 존재하지 않습니다." }, { status: 401 });
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

        if (!userToken) {
            return NextResponse.json({ message: "유저 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!authenticateUser(userToken)) {
            return NextResponse.json({ message: "유저 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        // 클라이언트 측 쿠키 삭제
        const response = NextResponse.json({ success: true });

        // httpOnly 쿠키 삭제
        response.cookies.delete("authToken")
        response.cookies.delete("csrfToken")
        response.cookies.delete("hasGuest")
        response.cookies.delete("userToken")

        // UID를 기반으로 Redis에서 세션 삭제
        deleteSession(decodedToken.uid)
        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return NextResponse.json({ success: false, message: error || "Logout failed" }, { status: 500 });
    }
}
