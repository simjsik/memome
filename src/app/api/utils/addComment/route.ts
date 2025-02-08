import { NextRequest, NextResponse } from "next/server";
import { sessionExists } from "../redisClient";
import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { postId, parentId, commentId, text } = body;

    console.log(postId, parentId, commentId, text)
    const authToken = req.cookies.get("authToken")?.value;

    let decodedToken; // Firebase 또는 Google에서 디코드된 토큰

    if (!authToken) {
        return NextResponse.json({ message: "계정 토큰이 존재하지 않습니다." }, { status: 401 });
    }

    try {
        decodedToken = await adminAuth.verifyIdToken(authToken); // Firebase 토큰 검증
    } catch (err) {
        console.error("ID 토큰 검증 실패:", err);
        return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
    }

    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
        method: "POST",
        // 이미 토큰을 가져왔으니 여기선 필요 없음!
        body: JSON.stringify({ idToken: authToken }),
    });
    if (!tokenResponse?.ok) {
        const errorData = await tokenResponse?.json();
        console.error("Server-to-server error:", errorData.message);
        return NextResponse.json({ message: "토큰 인증 실패." }, { status: 403 });
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