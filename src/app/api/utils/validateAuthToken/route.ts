import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // HTTP-only 쿠키에 ID 토큰 저장
        const response = NextResponse.json({ message: "Token validated" });

        response.cookies.set("authToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            path: "/",
        });

        console.log("Decoded Token:", decodedToken); // 디버깅용
        return response;
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
