import { auth } from "@/app/DB/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis();  // Redis 클라이언트

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        const csrfToken = req.cookies.get("csrfToken")?.value;

        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential) {
            return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 403 });
        }

        const user = userCredential.user;

        if (!user.emailVerified) {
            return NextResponse.json({ message: "이메일 인증이 필요한 계정입니다." }, { status: 403 });
        }

        if (user) {

            const idToken = await userCredential.user.getIdToken();
            const hasGuest = false;

            if (idToken) {
                // 서버로 ID 토큰 검증을 위해 전송
                const csrfResponse = await fetch("/api/utils/validateAuthToken", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // 쿠키를 요청 및 응답에 포함
                    body: JSON.stringify({ idToken, csrfToken, hasGuest }),
                });

                if (csrfResponse.ok) {
                    const response = NextResponse.json({ message: "Token validated" });

                    // CSRF 토큰과 ID 토큰 검증이 끝났다면 어떻게 Redis에 세션 데이터를 저장하고 HTTP Only 쿠키에 JWT를 저장할까?
                    return response;
                } else {
                    return NextResponse.json({ message: "CSRF 토큰 인증 실패." }, { status: 403 });
                }
            }
        } else {
            return NextResponse.json({ message: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요." }, { status: 403 });
        }
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
