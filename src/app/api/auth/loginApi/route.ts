import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";
export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        const user = await adminAuth.getUserByEmail(email);
        // 커스텀 토큰 발급
        const customToken = await adminAuth.createCustomToken(user.uid);

        const response = NextResponse.json(customToken);

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
