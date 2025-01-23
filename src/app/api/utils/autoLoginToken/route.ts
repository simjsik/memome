import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { validateIdToken } from "../../auth/validateCsrfToken/route";
import { authenticateUser, getSession } from "../redisClient";

export async function GET(req: NextRequest) {
    try {
        // 쿠키에서 authToken 가져오기
        const authToken = req.cookies.get("authToken")?.value;
        const userToken = req.cookies.get("userToken")?.value;
        const hasGuest = req.cookies.get("hasGuest")?.value;

        if (!authToken) {
            return NextResponse.json({ message: "ID 토큰이 존재하지 않습니다." }, { status: 401 });
        }
        if (!userToken) {
            return NextResponse.json({ message: "유저 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        // ID 토큰 검증
        if (!validateIdToken(authToken)) {
            return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const decodedToken = await adminAuth.verifyIdToken(authToken);

        if (!authenticateUser(userToken)) {
            return NextResponse.json({ message: "유저 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const userData = await getSession(decodedToken.uid)
        if (!userData) {
            return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
        }

        console.log(userData, '유저 정보')
        // 사용자 정보 반환
        return NextResponse.json({
            message: "자동 로그인 성공",
            user: {
                uid: decodedToken.uid,
                email: userData.email,
                displayName: userData.name || "Anonymous",
                photoURL: userData.photo || null,
            },
            hasGuest: hasGuest ? true : false
        });
    } catch (error) {
        console.error("Auto-login token validation failed:", error);
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }
}
