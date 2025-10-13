import express, { Request, Response } from "express";
import { FieldValue, Filter, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../../DB/firebaseAdminConfig";
import admin from 'firebase-admin';
import { getCachedUserBatch } from "./utils/getCachedUser";
import { extractUniqueUserIds } from "./utils/getUserId";

const router = express.Router();

export interface PostData {
    tag: string;
    title: string;
    id?: string;
    userId: string;
    content: string;
    thumbnail?: ImageUrls;
    images: boolean;
    createAt: Timestamp;
    commentCount: number,
    notice: boolean,
    displayName?: string,
    photoURL?: string,
    objectID?: string,
}

export interface ImageUrls {
    key?: string;
    localSrc?: string;
}

export const postConverter: FirebaseFirestore.FirestoreDataConverter<PostData> = {
    toFirestore: (p) => p,
    fromFirestore: (snap) => snap.data() as PostData,
};

router.post('/post', async (req: Request, res: Response) => {
    try {
        // 사용량 제한
        const user = req.headers['x-user-uid'];

        if (!user) {
            return res.status(403).json({ error: '유저가 없습니다' });
        }
        const limitCount = 80;

        const currentTime = new Date();
        const today = currentTime.toISOString().split('T')[0]; // 오늘 날짜

        // Firestore에서 문서 참조 얻기
        const userDocRef = adminDb.doc(`userUsage/${user}`);

        const userDocSnap = await userDocRef.get();

        const userDoc = userDocSnap.data() as {
            readCount: number, lastUpdate: string
        };

        if (!userDocSnap.exists) {
            await userDocRef.set({ readCount: 0, lastUpdate: today });
        } else {
            const { readCount, lastUpdate } = userDoc;

            if (lastUpdate != today) {
                await userDocRef.set({
                    readCount: 0,
                    lastUpdate: today,
                }, { merge: true });
            } else if (readCount >= limitCount) {
                return res.status(429).json({ error: '사용량이 초과되었습니다.' });
            } else {
                await adminDb.runTransaction(async (tx) => {
                    tx.update(userDocRef, {
                        readCount: FieldValue.increment(1),
                    });
                });
            }
        }

        // 포스트 요청
        const { pageParam, pageSize } = req.body;

        const ps = Math.min(Math.max(Number(pageSize) || 10, 1), 50);

        const postRef = adminDb.collection('posts').withConverter(postConverter);

        let firstQuery = postRef
            .where('notice', '==', false)
            .where(Filter.or(
                Filter.where('public', '==', true),
                Filter.where('userId', '==', user),
            ))
            .orderBy('createAt', 'desc')
            .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
            .limit(ps + 1); // 필요한 수 만큼 데이터 가져오기

        if (pageParam) {
            const setCursor = new admin.firestore.Timestamp(
                pageParam.createAt.seconds,
                pageParam.createAt.nanoseconds
            );

            firstQuery = firstQuery.startAfter(setCursor, pageParam.id);
        }

        const postSnap = await firstQuery.get();

        let postDoc = postSnap.docs.slice(0, Math.min(postSnap.docs.length, ps));

        const hasMore1 = postSnap.docs.length > ps;

        let hasMore2 = false;

        // 부족한 수 보강
        if (postDoc.length < ps && postDoc.length > 0) {
            const last = postDoc[postDoc.length - 1];

            const remaining = ps - postDoc.length;

            const lastAt = last.data();
            const lastCursor = {
                id: last.id,
                createAt: {
                    seconds: lastAt.createAt.seconds,
                    nanoseconds: lastAt.createAt.nanoseconds,
                },
            };

            let secondQuery = postRef
                .where('notice', '==', false)
                .where('public', '==', true)
                .orderBy('createAt', 'desc')
                .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
                .limit(remaining + 1); // 버퍼 적용

            const lastTs = lastAt.createAt as admin.firestore.Timestamp;
            secondQuery = secondQuery.startAfter(lastTs, lastCursor.id);

            const moreSnap = await secondQuery.get();

            postDoc = [...postDoc, ...moreSnap.docs];
            postDoc = postDoc.slice(0, ps);
            hasMore2 = moreSnap.docs.length > (remaining);
        }

        const userId = extractUniqueUserIds(postDoc);
        const profileMap = await getCachedUserBatch(userId);

        const postWithUser: PostData[] = postDoc.map((document) => {
            const postData = document.data();
            const profile = profileMap.get(postData.userId) ?? {
                displayName: "Unknown User",
                photoURL:
                    'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
            };

            return {
                id: document.id,
                ...postData,
                displayName: profile.displayName,
                photoURL: profile.photoURL,
            };
        });

        const hasNext = hasMore2 || (hasMore1 && postDoc.length >= ps);
        const lastVisible = postWithUser ? postWithUser.at(-1) : null; // 마지막 문서

        return res.json({
            message: "포스트 요청 성공",
            data: postWithUser,
            nextPage: hasNext && lastVisible ?
                { id: lastVisible.id, createAt: lastVisible.createAt as Timestamp } : undefined,
        });
    } catch (error) {
        console.error("포스트 요청 실패:", error);
        return res.status(500).json({ message: "포스트 요청 실패" });
    }
});

export default router;
