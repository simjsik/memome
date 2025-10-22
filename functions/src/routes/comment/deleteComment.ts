import express, { Request, Response } from "express";
import admin from 'firebase-admin';
import { adminDb } from "../../DB/firebaseAdminConfig";

const router = express.Router();

/**
 * @param {req<Request>} req
 * @param {res<Response>} res
 */
async function deleteComment(req: Request, res: Response) {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;

    const user = req.headers['x-user-uid'];
    const isAdmin = req.headers['x-user-admin'];

    try {
        await adminDb.runTransaction(async (tx) => {
            const commentRef = adminDb.doc(`posts/${postId}/comments/${commentId}`);
            const commentSnap = await tx.get(commentRef);

            if (!commentSnap.exists) {
                throw new Error("존재하지 않는 댓글입니다");
            }

            const commentData = commentSnap.data();

            if (!commentData) {
                throw new Error("존재하지 않는 댓글입니다");
            }
            if (commentData?.userId !== user && isAdmin !== 'true') {
                throw new Error("삭제 권한이 없습니다");
            }

            if (!replyId) { // 댓글일 때
                if (commentData.replyCount ?? 0) {
                    tx.update(commentRef,
                        {
                            deleted: true,
                            deletedAt: admin.firestore.Timestamp.now(),
                            deletedBy: user,
                        },
                    );
                } else {
                    tx.delete(commentRef);
                }
            } else { // 답글일 때
                const replyRef = adminDb.doc(`posts/${postId}/comments/${commentId}/reply/${replyId}`);
                const replySnap = await tx.get(replyRef);

                if (!replySnap.exists) {
                    throw new Error("존재하지 않는 댓글입니다");
                }
                const replyData = replySnap.data();

                if (!replyData) {
                    throw new Error("존재하지 않는 댓글입니다");
                }
                if (replyData?.userId !== user && isAdmin !== 'true') {
                    throw new Error("삭제 권한이 없습니다");
                }

                if (replyData.parentId !== commentId) {
                    throw new Error("잘못된 요청 입니다");
                }

                tx.delete(replyRef);

                const prev = Number(commentSnap.data()?.replyCount ?? 0);
                const next = Math.max(0, prev - 1);
                const tomb = commentSnap.data()?.deleted === true;

                if (tomb && next === 0) {
                    tx.delete(commentRef);
                }
            }
        });
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('댓글 삭제 실패:' + error);
        return res.status(500).json({
            message: "댓글 삭제 실패",
            error: error,
        });
    }
}

router.delete('/posts/:postId/comments/:commentId', deleteComment);
router.delete('/posts/:postId/comments/:commentId/reply/:replyId', deleteComment);

export default router;
