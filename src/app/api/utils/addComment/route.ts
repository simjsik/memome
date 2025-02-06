import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, sessionExists } from "../redisClient";
import { validateIdToken } from "../../auth/validateCsrfToken/route";
import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { postId, parentId, commentId, text } = body;

    console.log(postId, parentId, commentId, text)

    const authToken = req.cookies.get("authToken")?.value;
    const userToken = req.cookies.get("userToken")?.value;

    let decodedToken; // Firebase 또는 Google에서 디코드된 토큰
    let userData;     // Redis에서 가져온 유저 데이터

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

    // UID를 기반으로 Redis에서 세션 조회
    try {
        userData = await sessionExists(decodedToken.uid); // Redis에서 세션 가져오기
        if (!userData) {
            return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
        }
    } catch (err) {
        console.error("Redis 세션 조회 실패:", err);
        return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
    }

    const userId = decodedToken.uid;
    const commentRef = adminDb.collection(`posts/${postId}/comments`);

    try {
        const commentData = {
            replyId: commentId,
            user: userId,
            commentText: text,
            createAt: Timestamp.now(),
            parentId,
        }

        // firebase에 추가
        const newCommentRef = await commentRef.add(commentData);
        const newCommentId = newCommentRef.id;

        // 댓글 수 수정
        const postRef = adminDb.doc(`posts/${postId}`)
        await postRef.update({
            commentCount: FieldValue.increment(1)
        })

        return NextResponse.json({ message: "댓글 작성 완료", commentData: commentData, id: newCommentId }, { status: 200 });
    } catch (error) {
        console.error('댓글 추가 중 오류:', error);
        return NextResponse.json({ message: "댓글 추가 중 오류" }, { status: 403 });
    }
}