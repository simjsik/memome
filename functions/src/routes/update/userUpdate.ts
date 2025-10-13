import express, { Request, Response } from "express";
import { adminDb } from "../../DB/firebaseAdminConfig";
import admin from 'firebase-admin';
import { getCachedUserBatch } from "../post/utils/getCachedUser";
import { postConverter, PostData } from "../post/mainPost";
import { extractUniqueUserIds } from "../post/utils/getUserId";

const router = express.Router();

router.post('/update/post', async (req: Request, res: Response) => {
    const { newest, newestId, hasGuest } = req.body;
    const uid = req.headers['x-user-uid'];

    if (!uid || typeof uid !== 'string') {
        return res.status(401).json({ message: '인증 정보가 없습니다.' });
    }

    try {
        const docRef = hasGuest ? adminDb.doc(`guests/${uid}/status/postUpdates`) : adminDb.doc(`users/${uid}/status/postUpdates`);

        const postRef = adminDb.collection('posts').withConverter(postConverter);

        let postsQuery = postRef
            .where('notice', '==', false)
            .where('public', '==', true)
            .orderBy('createAt', 'asc')
            .orderBy(admin.firestore.FieldPath.documentId(), 'asc');

        if (typeof newest === 'number' && typeof newestId === 'string' && newest > 0) {
            const newestDate = admin.firestore.Timestamp.fromMillis(newest);
            postsQuery = postsQuery.startAfter(newestDate, newestId);
        } else {
            await adminDb.runTransaction(async (tx) => {
                tx.set(docRef, { lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
            });

            return res.json({
                message: "새 포스트 없음",
                data: [],
            });
        }

        const querySnapshot = await postsQuery.get();
        if (!querySnapshot.empty) {
            await adminDb.runTransaction(async (tx) => {
                tx.set(docRef, { lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
            });

            return res.json({
                message: "새 포스트 없음",
                data: [],
            });
        }

        const postDoc = querySnapshot.docs;

        const userId = extractUniqueUserIds(postDoc);
        const profileMap = await getCachedUserBatch(userId);

        const ascPosts: PostData[] = postDoc.map((document) => {
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

        const postWithUser = ascPosts.reverse();

        await adminDb.runTransaction(async (tx) => {
            tx.set(docRef, { lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        });

        return res.json({
            message: "포스트 요청 성공",
            data: postWithUser,
        });
    } catch (error) {
        console.error("포스트 요청 실패:", error);
        return res.status(500).json({ message: "포스트 요청 실패" });
    }
});
