import { NextRequest, NextResponse } from "next/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/DB/firebaseConfig";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Firebase Client SDK로 이메일 및 비밀번호 검증
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ID 토큰 발급
        const idToken = await user.getIdToken();

        // ID 토큰을 HTTP-only 쿠키에 저장
        const response = NextResponse.json({ message: "Login successful" });
        response.cookies.set("authToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        return response;
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
