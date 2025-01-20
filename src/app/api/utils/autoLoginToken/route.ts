import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";

export async function GET(req: NextRequest) {
    try {
        // 쿠키에서 authToken 가져오기
        const authToken = req.cookies.get("authToken")?.value;
        const hasGuest = req.cookies.get("hasGuest")?.value;

        if (!authToken) {
            return NextResponse.json({ message: "No auth token found" }, { status: 401 });
        }


        // ID 토큰 검증
        const decodedToken = await adminAuth.verifyIdToken(authToken);
        // 사용자 정보 반환
        return NextResponse.json({
            message: "Auto login successful",
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                displayName: decodedToken.name || "Anonymous",
                photoURL: decodedToken.picture || null,
            },
            hasGuest: hasGuest ? true : false
        });
    } catch (error) {
        console.error("Auto-login token validation failed:", error);
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }
}
