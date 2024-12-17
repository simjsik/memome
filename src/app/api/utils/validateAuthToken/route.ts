import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || cookies().get("authToken")?.value;

    // console.log("Authorization Header:", authHeader); // 디버깅용
    // console.log("Cookie Token:", cookies().get("authToken")); // 디버깅용


    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        // console.log("Decoded Token:", decodedToken); // 디버깅용
        return NextResponse.json({ decodedToken });
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json({ message: "Invalid token" }, { status: 403 });
    }
}
