import { v2 as cloudinary } from "cloudinary";
import express, { Request, Response } from "express";
import * as cheerio from 'cheerio';
import { Timestamp } from "firebase-admin/firestore";
import admin from 'firebase-admin';
import { imageCheck } from "./utils/imgMiBf";
import { adminDb } from "../../DB/firebaseAdminConfig";
import { getCachedUserBatch } from "./utils/getCachedUser";

// Cloudinary 설정
cloudinary.config({
    cloud_name: process.env.MY_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.MY_CLOUDINARY_API_KEY,
    api_secret: process.env.MY_CLOUDINARY_API_SECRET,
});

const router = express.Router();

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMG = 4;
const ALLOWED_MIMES =
    new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

type ImageType = {
    publicId?: string;
    localSrc?: string;
};

type PostType = {
    userId: string;
    displayName: string;
    photoUrl: string;
    title: string;
    content: string;
    tag: string;
    notice: boolean;
    public: boolean;
    thumbnail?: string | null;
    hasImage?: boolean;
    imageUrls?: ImageType[] | null;
    createAt: Timestamp,
    commentCount: number,
};


router.post('/posting', async (req: Request, res: Response) => {
    const { default: pLimit } = await import('p-limit');
    const uid = req.headers['x-user-uid'];

    if (!uid || typeof uid !== 'string') {
        return res.status(401).json({ message: '인증 정보가 없습니다.' });
    }

    // 포스트
    const post = req.body as unknown as PostType;
    const { hasGuest } = req.body;
    const imageUrls = post.imageUrls;

    let cleanupPrefix: string | null = null;

    try {
        let finalContent = post.content;
        const finalUrl: Array<{ index: number, url: string }> = [];

        const postRef = adminDb.collection("posts").doc();
        const postId = postRef.id;

        cleanupPrefix = `meloudy_imgs/post/${postId}/`;

        if (Array.isArray(imageUrls)) {
            const imgLength = imageUrls.length;

            if (imgLength > MAX_IMG) {
                return res.status(400).json({
                    message: `입력 가능한 이미지 수(${imgLength - MAX_IMG})를 초과 하였습니다. `,
                });
            }

            const nonEmpty = (v?: string | null) =>
                typeof v === 'string' && v.trim().length > 0;

            if (!imageUrls.every((i) => (nonEmpty(i.localSrc)))) {
                return res.status(400).json({
                    message: '허용되지 않은 이미지 URL 입니다.',
                });
            }

            // 원본 이미지
            const sources: string[] = imageUrls.map((i) => i?.localSrc || '').filter(Boolean);

            // 이미지 검사
            const checkedImg = await Promise.all(sources.map((src) => imageCheck(src)));

            // 이미 CDN인 이미지
            const cdnImg: Array<{ index: number; url: string }> = [];

            // 업로드 필요 이미지 배열
            const toUpload: Array<{
                index: number,
                buffer: Buffer,
                mime?: string,
            }> = [];

            for (let i = 0; i < checkedImg.length; i++) {
                const img = checkedImg[i];
                if (img.kind === 'resolved') {
                    const { mime, buffer } = img;

                    const normalized = mime?.split(';')[0];
                    if (normalized && !ALLOWED_MIMES.has(normalized)) {
                        throw new Error('지원하지 않는 타입 ' + normalized);
                    }

                    if (buffer.length > MAX_BYTES) {
                        throw new Error('이미지 사이즈 초과' + `bytes: ${buffer.length}`);
                    }

                    toUpload.push({ index: i, buffer, mime });
                } else if (img.kind === 'cdn') {
                    cdnImg.push({ index: i, url: img.finalUrl });
                }
            }

            // CDN 이미지 업로드
            const uploadLimit = pLimit(3);
            const uploadTasks = toUpload.map(({ index, buffer, mime }) => uploadLimit(async () => {
                const finalMime = (mime ?? 'image/jpeg').split(';')[0];
                const dataUrl = `data:${finalMime};base64,${buffer.toString('base64')}`;

                const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
                    folder: `meloudy_imgs/post/${postId}`,
                    resource_type: 'image', // base64 데이터
                    unique_filename: true, // 중복 파일 이름 허용. 중복 시 덮어쓰기 위함
                    invalidate: false,
                    overwrite: false,
                });

                return { index, url: uploadResponse.secure_url };
            }));

            const cdnReuploadTasks = cdnImg.map(({ index, url }) =>
                uploadLimit(async () => {
                    const up = await cloudinary.uploader.upload(url, {
                        folder: cleanupPrefix!, resource_type: 'image',
                        unique_filename: true,
                        overwrite: false,
                    });
                    return { index, url: up.secure_url };
                })
            );
            const uploadedImg = await Promise.all([...uploadTasks, ...cdnReuploadTasks]);

            finalUrl.push(...uploadedImg);
            // index 정렬
            finalUrl.sort((a, b) => a.index - b.index);

            const $ = cheerio.load(post.content ?? '');

            const contImg = $('img');
            if (contImg.length !== finalUrl.length) {
                throw new Error(`본문과 일치하지 않습니다. : 이미지 수 불일치`);
            }

            if (finalUrl.length !== checkedImg.length) {
                throw new Error('본문과 일치하지 않습니다. : 이미지 수 불일치');
            }

            contImg.each((i, el) => {
                const changeImg = finalUrl[i]?.url;
                if (!changeImg) throw new Error(`변경 이미지 누락: index=${i}`);

                $(el).attr('src', changeImg);
            });

            finalContent = $('body').html() ?? '';
        }

        const profiles = await getCachedUserBatch(uid);

        const profile = profiles.get(uid) ?? {
            displayName: "Unknown User",
            photoURL:
                'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
        };

        const finalPost: PostType = {
            tag: post.tag,
            title: post.title,
            userId: uid,
            displayName: profile.displayName,
            photoUrl: profile.photoURL,
            content: finalContent,
            thumbnail: finalUrl.length ? finalUrl[0].url : null,
            hasImage: finalUrl.length ? true : false,
            createAt: admin.firestore.Timestamp.now(),
            commentCount: 0,
            notice: post.notice,
            public: post.public,
        };

        const feedRef = post.notice ? adminDb.doc("postFeed/notice") : adminDb.doc("postFeed/main");
        const userRef = hasGuest ? adminDb.doc(`guests/${uid}/status/postUpdates`) : adminDb.doc(`users/${uid}/status/postUpdates`);

        await adminDb.runTransaction(async (tx) => {
            const feedSnap = await tx.get(feedRef);
            const feed = feedSnap.data();

            tx.set(postRef, finalPost);
            tx.set(userRef, { lastSeenAt: finalPost.createAt }, { merge: true });

            if (!feed?.updatedAt || feed.updatedAt.toMillis() <= finalPost.createAt.toMillis()) {
                tx.set(feedRef, { updatedAt: finalPost.createAt }, { merge: true });
            }
        });

        const toClientPost = {
            ...finalPost,
            id: postId,
            createAt: finalPost.createAt.toMillis(),
        };

        return res.status(200).json({ post: toClientPost });
    } catch (error) {
        console.error('포스트 업로드 실패', error);

        if (cleanupPrefix) {
            try {
                await cloudinary.api.delete_resources_by_prefix(cleanupPrefix, {
                    resource_type: 'image',
                });
            } catch (purgeErr) {
                console.error('클린업 실패', purgeErr);
            }
        }

        return res.status(500).json({ message: "포스트 업로드 실패" });
    }
});

export default router;
