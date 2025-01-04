import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // 클라이언트 측 쿠키 삭제
        const response = NextResponse.json({ success: true });

        // httpOnly 쿠키 삭제
        response.cookies.delete("authToken")
        response.cookies.delete("csrfToken")

        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return NextResponse.json({ success: false, message: error || "Logout failed" }, { status: 500 });
    }
}
