import { auth } from "@/app/DB/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NextRequest, NextResponse } from "next/server";
import { saveSession } from "../../utils/redisClient";
import { generateJwt } from "../validateCsrfToken/route";

export async function POST(req: NextRequest) {
    try {
        const { email, password, hasGuest } = await req.json();

        const csrfToken = req.cookies.get("csrfToken")?.value;
        let role = 2

        if (email === 'simjsik75@naver.com') {
            role = 3
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential) {
            return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 403 });
        }

        const user = userCredential.user;
        if (!user) {
            return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 403 });
        }
        if (!user.emailVerified) {
            return NextResponse.json({ message: "이메일 인증이 필요한 계정입니다." }, { status: 403 });
        }

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
            return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 403 });
        }

        const uid = user.uid

        const userSession = {
            uid: uid,
            name: user.displayName || "",
            photo: user.photoURL || "",
            email: user.email || "",
            role: role
        };

        // 서버로 ID 토큰 검증을 위해 전송
        const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
            method: "POST",
            // 이미 토큰을 가져왔으니 여기선 필요 없음!
            body: JSON.stringify({ idToken, csrfToken }),
        });

        if (!csrfResponse.ok) {
            const errorData = await csrfResponse.json();
            console.error("Server-to-server error:", errorData.message);
            return NextResponse.json({ message: "CSRF 토큰 인증 실패." }, { status: 411 });
        }

        const UID = generateJwt(uid, role);

        const response = NextResponse.json({ message: "Token validated", uid });

        await saveSession(user.uid, userSession); // Redis에 세션 저장

        response.cookies.set("authToken", idToken, {
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

        response.cookies.set("hasGuest", hasGuest, {
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
