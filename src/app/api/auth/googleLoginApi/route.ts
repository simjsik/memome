import { NextRequest, NextResponse } from "next/server";
import { saveSession } from "../../utils/redisClient";
import { generateJwt, validateGoogleToken, validateIdToken } from "../validateCsrfToken/route";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";

export async function POST(req: NextRequest) {
    try {
        const { googleToken } = await req.json();
        const decodedToken = await adminAuth.verifyIdToken(googleToken);

        const csrfToken = req.cookies.get("csrfToken")?.value;
        console.log(decodedToken, '구글 디코드')

        // ID 토큰 검증
        if (!decodedToken) {
            return NextResponse.json({ message: "구글 계정이 올바르지 않습니다." }, { status: 403 });
        }

        if (!validateIdToken(googleToken)) {
            return NextResponse.json({ message: "구글 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const role = 2

        const uid = decodedToken.user_id

        const userSession = {
            uid: uid,
            name: decodedToken.name || "",
            photo: decodedToken.picture || "",
            email: decodedToken.email || "",
            role: role
        };

        // 서버로 ID 토큰 검증을 위해 전송
        const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
            method: "POST",
            // 이미 토큰을 가져왔으니 여기선 필요 없음!
            body: JSON.stringify({ googleToken, csrfToken }),
        });

        if (!csrfResponse.ok) {
            const errorData = await csrfResponse.json();
            console.error("Server-to-server error:", errorData.message);
            return NextResponse.json({ message: "CSRF 토큰 인증 실패." }, { status: 403 });
        }

        const UID = generateJwt(uid, role);

        const response = NextResponse.json({ message: "Token validated", uid });

        await saveSession(uid, userSession); // Redis에 세션 저장

        response.cookies.set("authToken", googleToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        response.cookies.set("userToken", UID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        response.cookies.set("hasGuest", 'false', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        // 추가적인 헤더 설정
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response;
        // 커스텀 토큰 발급
    } catch (error) {
        console.error("Login error:", error);
        if (error === "auth/user-not-found") {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        } else if (error === "auth/wrong-password") {
            return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
        }
        return NextResponse.json({ message: "Login failed" }, { status: 500 });
    }
}
