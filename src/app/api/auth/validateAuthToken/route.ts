import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import redisClient from "../../utils/redisClient";

export async function POST(req: NextRequest) {
    try {
        const { idToken, csrfToken, googleToken } = await req.json();

        if (!csrfToken) {
            return NextResponse.json({ message: "CSRF 토큰이 누락되었습니다." }, { status: 403 });
        }

        if (!idToken && !googleToken) {
            return NextResponse.json({ message: "계정 토큰이 누락되었습니다." }, { status: 403 });
        }

        if (idToken) {
            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                if (!decodedToken) {
                    return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
                }
            } catch (error) {
                return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
            }
        }

        if (googleToken) {
            try {
                const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
                if (!response.ok) {
                    return NextResponse.json({ message: "구글 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
                }
                const googleUser = await response.json();
                if (!googleUser) {
                    return NextResponse.json({ message: "구글 유저 정보가 유효하지 않습니다." }, { status: 403 });
                }
            } catch (error) {
                return NextResponse.json({ message: "구글 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
            }
        }

        try {
            // Redis에서 토큰의 만료 시간 가져오기
            const expiresAt = await redisClient.get(csrfToken);

            // 토큰이 존재하지 않거나 만료된 경우
            if (!expiresAt || Date.now() > Number(expiresAt)) {
                console.log("CSRF 토큰 만료됨.");

                // 만료된 토큰 삭제
                await redisClient.del(csrfToken);

                return NextResponse.json({ message: "CSRF 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
            }
        } catch (error) {
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
