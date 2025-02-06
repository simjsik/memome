import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "../redisClient";
import { validateIdToken } from "../../auth/validateCsrfToken/route";
import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { noticeId } = body;

        const authToken = req.cookies.get("authToken")?.value;
        const userToken = req.cookies.get("userToken")?.value;

        let decodedToken; // Firebase 또는 Google에서 디코드된 토큰

        if (!authToken) {
            return NextResponse.json({ message: "계정 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!userToken) {
            return NextResponse.json({ message: "유저 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!authenticateUser(userToken)) {
            return NextResponse.json({ message: "유저 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        if (!validateIdToken(authToken)) {
            return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        try {
            decodedToken = await adminAuth.verifyIdToken(authToken); // Firebase 토큰 검증
        } catch (err) {
            console.error("ID 토큰 검증 실패:", err);
            return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const UID = decodedToken.uid

        const noticeDoc = await adminDb.doc(`users/${UID}/noticeList/${noticeId}`);

        if (!noticeDoc) {
            alert('해당 게시글을 찾을 수 없습니다.')
            return;
        }
        // 삭제 권한 확인
        await noticeDoc.update({
            noticeId: FieldValue.delete()  // noticeId 필드만 삭제
        });

        return NextResponse.json({ message: "공지 확인" }, { status: 200 });
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
