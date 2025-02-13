import { authenticateUser, deleteSession } from "@/app/utils/redisClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const userToken = req.cookies.get("userToken")?.value;
        const hasGuest = req.cookies.get("hasGuest")?.value;

        if (!userToken) {
            return NextResponse.json({ message: "유저 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!authenticateUser(userToken)) {
            return NextResponse.json({ message: "유저 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const uid = await authenticateUser(userToken) as string

        // 클라이언트 측 쿠키 삭제
        const response = NextResponse.json({ success: true });

        // httpOnly 쿠키 삭제
        response.cookies.delete("authToken")
        response.cookies.delete("csrfToken")
        response.cookies.delete("hasGuest")
        response.cookies.delete("userToken")

        if (!hasGuest) {
            deleteSession(uid)
        }
        // UID를 기반으로 Redis에서 세션 삭제
        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return NextResponse.json({ success: false, message: error || "Logout failed" }, { status: 500 });
    }
}
