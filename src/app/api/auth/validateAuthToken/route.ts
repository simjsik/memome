import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import redisClient, { authenticateUser, sessionExists } from "@/app/utils/redisClient";

export async function POST(req: NextRequest) {
    try {
        const { idToken, uid } = await req.json();

        const authToken = req.cookies.get("authToken")?.value;
        const userToken = req.cookies.get("userToken")?.value;
        const csrfToken = req.cookies.get("csrfToken")?.value;

        if (!idToken && !uid) {
            return NextResponse.json({ message: "토큰 및 UID가 누락되었습니다." }, { status: 403 });
        }

        if (idToken) { // 로그인 시 ID 토큰 검증 용
            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                if (!decodedToken) {
                    return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
                }
            } catch (error) {
                return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
            }
        }

        if (uid) { // 로그인 후 유저 검증 용
            if (!authToken) {
                return NextResponse.json({ message: "ID 토큰이 누락 되었습니다." }, { status: 403 });
            }

            const decodedToken = await adminAuth.verifyIdToken(authToken);

            if (!decodedToken) {
                return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
            }

            if (!userToken) {
                return NextResponse.json({ message: "유저 토큰이 누락되었습니다." }, { status: 403 });
            }

            if (!await authenticateUser(userToken)) {
                return NextResponse.json({ message: "유저 토큰이 유효하지 않습니다." }, { status: 403 });
            }

            // UID를 기반으로 Redis에서 세션 조회
            try {
                const userData = await sessionExists(decodedToken.uid); // Redis에서 세션 가져오기
                if (!userData) {
                    return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
                }
            } catch (err) {
                console.error("Redis 세션 조회 실패:", err);
                return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
            }
        }

        if (csrfToken) {
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
        }

        const response = NextResponse.json({ message: "유저 검증 확인" }, { status: 200 });

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
