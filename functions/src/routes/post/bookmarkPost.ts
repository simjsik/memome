import express, { Request, Response } from "express";
import { adminDb } from "../../DB/firebaseAdminConfig";
import admin from 'firebase-admin';
import { getCachedUserBatch } from "./utils/getCachedUser";
import { extractUniqueUserIdsFromPosts } from "./utils/getUserId";
import { fromPostData, postConverter, toPostData } from "./utils/postType";
import { usageLimit } from "./utils/useageLimit";

const router = express.Router();

router.post('/post/bookmark', async (req: Request, res: Response) => {
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
        const { bookmarkId, pageParam, pageSize } = req.body;
        const startIndex = Math.max(Number(pageParam) || 0, 0);
        const ps = Math.min(Math.max(Number(pageSize) || 4, 1), 10);

        const bookmarkRef = adminDb.collection(`users/${user}/bookmarks`);
        const bookmarkBase = bookmarkRef
            .orderBy('bookmarkedAt', 'desc')
            .orderBy(admin.firestore.FieldPath.documentId(), 'desc');

        const results: fromPostData[] = [];

        let totalExamined = 0;
        let hasMoreBookmarks = true;

        const FETCH_BATCH = 20; // 한번에 가져올 북마크 컬렉션의 북마크 리스트. 포스트 아님
        const POST_CHUNK = 5; // 포스트 접근할 때 한번에 이만큼씩 해라. 한 루프에서 이만큼 totalExamined이 증가.

        while (results.length < ps && hasMoreBookmarks) {
            // 현재 인덱스 = startIndex + totalExamined
            const bookmarkSnap = await bookmarkBase.offset(startIndex + totalExamined).limit(FETCH_BATCH).get();
            if (bookmarkSnap.empty) {
                hasMoreBookmarks = false; break;
            }

            const bookmarkIds = bookmarkSnap.docs.map((d) => d.id);

            // 10개 청크로 배치 조회
            for (let i = 0; i < bookmarkIds.length && results.length < ps; i += POST_CHUNK) {
                const seg = bookmarkIds.slice(i, i + POST_CHUNK);
                totalExamined += seg.length; // 북마크 수

                const postRef = seg.map((id) => admin.firestore().doc(`posts/${id}`).withConverter(postConverter));
                const postSnaps = await admin.firestore().getAll(...postRef);

                // id → snapshot 매핑 (순서 보전)
                const map = new Map(postSnaps.map((s) => [s.id, s]));
                for (const id of seg) {
                    const s = map.get(id);
                    if (!s || !s.exists) continue;

                    const data = s.data() as fromPostData;

                    // 5) 가시성 필터: 공지 제외 + 공개 or 내 글
                    if (!(data.public === true || data.userId === user)) continue;

                    results.push({ id, ...data });
                    if (results.length >= ps) break;
                }
            }

            // 더 이상 북마크가 없으면 종료
            if (bookmarkSnap.size < FETCH_BATCH) hasMoreBookmarks = false;
        }

        // 유저 매핑
        const userId = extractUniqueUserIdsFromPosts(results);
        const profileMap = await getCachedUserBatch(userId);

        const postWithUser: toPostData[] = results.map((post) => {
            const createAt = post.createAt;
            const profile = profileMap.get(post.userId) ?? {
                displayName: "Unknown User",
                photoURL:
                    'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
            };

            return {
                ...post,
                displayName: profile.displayName,
                photoURL: profile.photoURL,
                createAt: createAt.toMillis(),
            };
        });

        const lastVisible = postWithUser ? postWithUser.at(-1) : null; // 마지막 문서

        return res.status(200).json({
            message: "포스트 요청 성공",
            data: postWithUser,
            nextPage: hasMoreBookmarks && lastVisible ? bookmarkId.length + postWithUser.length : undefined,
        });
    } catch (error) {
        console.error("포스트 요청 실패:", error);
        return res.status(500).json({ message: "포스트 요청 실패" });
    }
});

export default router;
