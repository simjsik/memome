import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, orderBy, query, } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import { Comment } from "@/app/state/PostState";


export async function POST(req: NextRequest) {
    const body = await req.json();
    const { postId } = body;
    if (postId === 'undefined') {
        throw new Error('존재하지 않는 포스트입니다.')
    }
    try {
        // 2. 댓글 가져오기
        const commentRef = collection(db, 'posts', postId, 'comments');
        const commentQuery = query(commentRef, orderBy('createAt', 'asc'));
        const commentSnap = await getDocs(commentQuery);

        if (!commentSnap) {
            throw new Error('존재하지 않는 포스트입니다.')
        }

        // 3. 댓글 작성자(user) ID 수집
        const userIds = new Set<string>();
        const comments: Comment[] = commentSnap.docs.map((doc) => {
            const data = doc.data();
            userIds.add(data.user); // user 필드 중복 제거
            return {
                ...data,
                id: doc.id,
                replyId: data.replyId,
                user: data.user,
                commentText: data.commentText,
                createAt: data.createAt,
                replies: data.replies || [],
                parentId: data.parentId,
                displayName: data.displayName,
                PhotoURL: data.PhotoURL || null,
            };
        });

        return NextResponse.json(
            { comments: comments }
        )

    } catch (error) {
        console.error("Error fetching data:", error);
        return { comments: [] }; // 에러 발생 시 기본값 반환
    }
};
