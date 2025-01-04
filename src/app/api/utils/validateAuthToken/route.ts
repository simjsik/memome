import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "../../auth/validateCsrfToken/route";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        const csrfToken = req.cookies.get("csrfToken")?.value;

        if (!csrfToken) {
            return NextResponse.json({ message: "CSRF 토큰이 누락되었습니다." }, { status: 403 });
        }

        if (!validateCsrfToken(csrfToken)) {
            return NextResponse.json({ message: "CSRF 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }
        
        // console.log('CSRF 토큰 검증 완료')
        // const decodedToken = await adminAuth.verifyIdToken(idToken);

        // HTTP-only 쿠키에 ID 토큰 저장
        const response = NextResponse.json({ message: "Token validated" });

        response.cookies.set("authToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            path: "/",
        });

        // console.log('ID 토큰 HTTP-Only 쿠키 저장 완료')
        // console.log("Decoded Token:", decodedToken); // 디버깅용
        return response;
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
