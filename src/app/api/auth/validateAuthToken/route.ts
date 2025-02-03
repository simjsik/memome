import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken, validateGoogleToken, validateIdToken } from "../validateCsrfToken/route";


export async function POST(req: NextRequest) {
    try {
        const { idToken, csrfToken, googleToken } = await req.json();
        // console.error(!idToken, !csrfToken, !googleToken, '토큰 확인')

        if (!csrfToken) {
            return NextResponse.json({ message: "CSRF 토큰이 누락되었습니다." }, { status: 403 });
        }

        if (!idToken && !googleToken) {
            return NextResponse.json({ message: "계정 토큰이 누락되었습니다." }, { status: 403 });
        }

        if (idToken) {
            if (!validateIdToken(idToken)) {
                return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
            }
        }

        if (googleToken) {
            if (!validateGoogleToken(googleToken)) {
                return NextResponse.json({ message: "구글 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
            }
        }

        if (!validateCsrfToken(csrfToken)) {
            return NextResponse.json({ message: "CSRF 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const response = NextResponse.json({ message: "Token validated" });

        // 추가적인 헤더 설정
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");

        return response;
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
