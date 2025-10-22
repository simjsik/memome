import express, { Request, Response } from "express";
import admin from 'firebase-admin';
import { adminDb } from "../../DB/firebaseAdminConfig";
import { fromComment } from "./utils/postType";
import { getCachedUserBatch } from "./utils/getCachedUser";

const router = express.Router();

router.post('/comment', async (req: Request, res: Response) => {
    const uid = req.headers['x-user-uid'];

    if (!uid || typeof uid !== 'string') {
        return res.status(401).json({ message: '인증 정보가 없습니다.' });
    }

    // 포스트
    const { postId, comment, reply } = req.body;

    try {
        const commentRef = reply ? adminDb.collection(`posts/${postId}/comments/${comment.parentId}/reply`).doc() :
            adminDb.collection(`posts/${postId}/comments`).doc();

        const commentId = commentRef.id;

        const profiles = await getCachedUserBatch(uid);

        const profile = profiles.get(uid) ?? {
            displayName: "Unknown User",
            photoURL:
                'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
        };

        const finalComment: fromComment = {
            ...comment,
            id: commentId,
            userId: uid,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
            createAt: admin.firestore.Timestamp.now(),
        };

        await adminDb.runTransaction(async (tx) => {
            tx.set(commentRef, finalComment);
        });

        const toClientComment = {
            ...finalComment,
            id: commentId,
            createAt: finalComment.createAt.toMillis(),
        };

        return res.status(200).json({ comment: toClientComment });
    } catch (error) {
        console.error('댓글 업로드 실패', error);
        return res.status(500).json({ message: "댓글 업로드 실패" });
    }
});

export default router;
