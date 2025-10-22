import express, { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../../DB/firebaseAdminConfig";
import admin from 'firebase-admin';
import { getCachedUserBatch } from "./utils/getCachedUser";
import { extractUniqueUserIds } from "./utils/getUserId";
import { usageLimit } from "./utils/useageLimit";
import { commentConverter, toComment } from "./utils/postType";

const router = express.Router();

router.post('/post/comments', async (req: Request, res: Response) => {
    try {
        // 사용량 제한
        const user = req.get('x-user-uid');
        if (!user) {
            return res.status(403).json({ error: '유저가 없습니다' });
        }

        const useage = await usageLimit(user);
        if (!useage) {
            return res.status(429).json({ error: '사용량이 초과되었습니다.' });
        }

        // 포스트 요청
        const { pageParam, pageSize, postId, needReply, commentId } = req.body;

        const ps = Math.min(Math.max(Number(pageSize) || 10, 1), 50);

        const commentRef = needReply ? adminDb.collection(`posts/${postId}/comments/${commentId}/reply`).withConverter(commentConverter) :
            adminDb.collection(`posts/${postId}/comments`).withConverter(commentConverter);

        let firstQuery = commentRef
            .orderBy('createAt', 'asc')
            .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
            .limit(ps + 1); // 필요한 수 만큼 데이터 가져오기

        if (pageParam) {
            const setCursor = Timestamp.fromMillis(pageParam.createAt);

            firstQuery = firstQuery.startAfter(setCursor, pageParam.id);
        }

        const postSnap = await firstQuery.get();

        const commentDoc = postSnap.docs.slice(0, Math.min(postSnap.docs.length, ps));

        const hasMore = postSnap.docs.length > ps;

        const userId = extractUniqueUserIds(commentDoc);
        const profileMap = await getCachedUserBatch(userId);

        const commentWithUser: toComment[] = commentDoc.map((document) => {
            const commentData = document.data();
            const profile = profileMap.get(commentData.userId) ?? {
                displayName: "Unknown User",
                photoURL:
                    'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
            };

            return {
                id: document.id,
                ...commentData,
                displayName: profile.displayName,
                photoURL: profile.photoURL,
                createAt: commentData.createAt.toMillis(),
            };
        });

        const lastVisible = commentWithUser ? commentWithUser.at(-1) : null; // 마지막 문서

        return res.status(200).json({
            message: "댓글 요청 성공",
            data: commentWithUser,
            nextPage: hasMore && lastVisible ?
                { id: lastVisible.id, createAt: lastVisible.createAt as number } : undefined,
        });
    } catch (error) {
        console.error("댓글 요청 실패:", error);
        return res.status(500).json({ message: "댓글 요청 실패" });
    }
});

export default router;
