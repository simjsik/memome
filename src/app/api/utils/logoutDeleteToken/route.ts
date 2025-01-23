import { NextResponse } from "next/server";
import { deleteSession } from "../redisClient";

export async function POST(req: Request) {
    try {
        const { uid } = await req.json();

        // 클라이언트 측 쿠키 삭제
        const response = NextResponse.json({ success: true });

        // httpOnly 쿠키 삭제
        response.cookies.delete("authToken")
        response.cookies.delete("csrfToken")
        response.cookies.delete("hasGuest")
        response.cookies.delete("userToken")
        
        deleteSession(uid)
        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return NextResponse.json({ success: false, message: error || "Logout failed" }, { status: 500 });
    }
}
