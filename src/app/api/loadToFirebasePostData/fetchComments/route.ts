import { NextRequest, NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs, orderBy, query, } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import { Comment } from "@/app/state/PostState";


export async function POST(req: NextRequest) {
    const body = await req.json();
    const { postId } = body;

    if (!postId || postId === "undefined") {
        throw new Error('존재하지 않는 포스트입니다.');
    }

    try {
        // 2. 댓글 가져오기
        const commentRef = collection(db, 'posts', postId, 'comments');
        const commentQuery = query(commentRef, orderBy('createAt', 'asc'));
        const commentSnap = await getDocs(commentQuery);

        if (commentSnap.empty) {
            throw new Error('댓글이 존재하지 않습니다.');
        }

        const userCache = new Map<string, { displayName: string; photoURL: string | null }>();

        // 3. 각 댓글에 대해 작성자 정보 가져오기 (비동기 작업을 Promise.all으로 처리)
        const comments: Comment[] = await Promise.all(
            commentSnap.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();

                const userId: string = data.user;

                // 캐시에 작성자 정보가 없으면 먼저 users 컬렉션에서 조회
                let userData = userCache.get(userId);

                if (!userData) {
                    let userDoc = await getDoc(doc(db, 'users', userId));
                    // 만약 users 컬렉션에 문서가 없으면 guests 컬렉션에서 조회
                    if (!userDoc.exists()) {
                        userDoc = await getDoc(doc(db, 'guests', userId));
                    }
                    if (userDoc.exists()) {
                        userData = userDoc.data() as { displayName: string; photoURL: string | null };
                    } else {
                        userData = { displayName: 'Unknown', photoURL: null };
                    }
                    userCache.set(userId, userData);
                }

                return {
                    id: docSnapshot.id,
                    replyId: data.replyId,
                    user: userId,
                    commentText: data.commentText,
                    createAt: data.createAt,  // 필요하면 Timestamp 처리
                    replies: data.replies || [],
                    parentId: data.parentId || null,
                    displayName: userData.displayName,
                    PhotoURL: userData.photoURL,
                } as Comment;
            })
        );

        return NextResponse.json(
            { comments: comments }
        )

    } catch (error) {
        console.error("댓글 불러오기 실패:", error);
        return NextResponse.json(
            { comments: [] }
        )
    }
};
