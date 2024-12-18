import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // 클라이언트 측 쿠키 삭제
        const response = NextResponse.json({ success: true });

        // httpOnly 쿠키 삭제
        response.cookies.set("authToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // 프로덕션 환경에서만 secure 설정
            path: "/", // 쿠키의 경로 설정
        });

        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return NextResponse.json({ success: false, message: error || "Logout failed" }, { status: 500 });
    }
}
