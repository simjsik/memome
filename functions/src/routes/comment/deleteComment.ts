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
        const payload = await adminDb.runTransaction(async (tx) => {
            const commentRef = adminDb.doc(`posts/${postId}/comments/${commentId}`);
            const commentSnap = await tx.get(commentRef);

            if (!commentSnap.exists) {
                throw new Error("NF");
            }

            const commentData = commentSnap.data();

            if (!commentData) {
                throw new Error("NF");
            }
            if (commentData?.userId !== user && isAdmin !== 'true') {
                throw new Error("FB");
            }

            if (!replyId) { // 댓글일 때
                if (commentData.replyCount ?? 0) {
                    const deletedAt = admin.firestore.Timestamp.now();

                    tx.update(commentRef,
                        {
                            deleted: true,
                            deletedAt: deletedAt,
                            deletedBy: user,
                        },
                    );

                    return {
                        kind: "comment",
                        postId: postId,
                        commentId: commentId,
                        hardDeleted: false,
                        tombstoned: true,
                        deletedAt: deletedAt.toMillis(),
                        deletedBy: user,
                    };
                } else {
                    tx.delete(commentRef);

                    return {
                        kind: "comment",
                        postId: postId,
                        commentId: commentId,
                        hardDeleted: true,
                        tombstoned: false,
                        deletedAt: admin.firestore.Timestamp.now().toMillis(),
                        deletedBy: user,
                    };
                }
            } else { // 답글일 때
                const replyRef = adminDb.doc(`posts/${postId}/comments/${commentId}/reply/${replyId}`);
                const replySnap = await tx.get(replyRef);

                if (!replySnap.exists) {
                    throw new Error("NF");
                }
                const replyData = replySnap.data();

                if (!replyData) {
                    throw new Error("NF");
                }
                if (replyData?.userId !== user && isAdmin !== 'true') {
                    throw new Error("FB");
                }

                if (replyData.parentId !== commentId) {
                    throw new Error("NA");
                }

                tx.delete(replyRef);

                // 답글 삭제 후
                const prev = Number(commentSnap.data()?.replyCount ?? 0);
                const next = Math.max(0, prev - 1);
                const tomb = commentSnap.data()?.deleted === true;

                if (tomb && prev === 1) { // 댓글 하드 삭제
                    tx.delete(commentRef);

                    return {
                        kind: "reply",
                        postId: postId,
                        commentId: commentId,
                        replyId: replyId,
                        hardDeleted: true,
                        newReplyCount: next,
                        parentTombstoned: tomb,
                        parentHardDeleted: true,
                    };
                }

                return {
                    kind: "reply",
                    postId: postId,
                    commentId: commentId,
                    replyId: replyId,
                    hardDeleted: true,
                    newReplyCount: next,
                    parentTombstoned: tomb,
                    parentHardDeleted: false,
                };
            }
        });
        return res.status(200).json({ ok: true, result: payload });
    } catch (error) {
        console.error('댓글 삭제 실패:' + error);
        if (error instanceof Error && error.message === 'NF') {
            return res.status(404).json({
                message: "존재하지 않는 댓글입니다.",
                error: error,
            });
        } else if (error instanceof Error && error.message === 'FB') {
            return res.status(403).json({
                message: "삭제 권한이 없습니다.",
                error: error,
            });
        } else if (error instanceof Error && error.message === 'NA') {
            return res.status(403).json({
                message: "잘못된 요청입니다.",
                error: error,
            });
        } else {
            return res.status(500).json({
                message: "댓글 삭제 실패",
                error: error,
            });
        }
    }
}

router.delete('/posts/:postId/comments/:commentId', deleteComment);
router.delete('/posts/:postId/comments/:commentId/reply/:replyId', deleteComment);

export default router;
