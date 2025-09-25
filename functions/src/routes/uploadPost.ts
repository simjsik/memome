import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto"; // SHA-1 해시 생성용
import express, { Request, Response } from "express";
import { cloudinaryUrl, imageCheck } from "../utils/imgMiBf";
import * as cheerio from 'cheerio';
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../DB/firebaseAdminConfig";

// Cloudinary 설정
cloudinary.config({
    cloud_name: process.env.MY_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.MY_CLOUDINARY_API_KEY,
    api_secret: process.env.MY_CLOUDINARY_API_SECRET,
});

type CloudinaryResourceLite = {
    secure_url?: string;
};

const router = express.Router();

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMG = 4; // 5 MB
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
    thumbnail?: string | null;
    imageUrls?: ImageType[] | null;
    createAt: Timestamp,
    commentCount: number,
};


router.post('/posting', async (req: Request, res: Response) => {
    const { default: pLimit } = await import('p-limit');

    // 포스트
    const post = req.body as unknown as PostType;

    const imageUrls = post.imageUrls;
    try {
        let finalContent = post.content;
        const finalUrl: Array<{ index: number, url: string }> = [];

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

            // 업로드 필요 이미지 배열
            const toUpload: Array<{
                index: number,
                buffer: Buffer,
                mime?: string,
                hash?: string
            }> = [];

            // 이미 업로드된 CDN 이미지 배열
            const cdnImg: Array<{ index: number, url: string }> = [];

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

            // 업로드를 위해 중복 해시를 제거
            const uniqueHash = new Map<string, { buffer: Buffer, mime?: string }>();

            // 이미지 해시 생성
            for (let i = 0; i < toUpload.length; i++) {
                const img = toUpload[i];
                const buffer = img.buffer;

                const hash = crypto.createHash('sha256').update(buffer).digest('hex');

                img.hash = hash;

                uniqueHash.set(hash, { buffer: img.buffer, mime: img.mime });
            }

            // CDN 이미지 해시
            const hashToCdn = new Map<string, string>();

            // CDN에 없는 이미지 해시
            const missing: Array<{ hash: string; buffer: Buffer; mime?: string }> = [];

            // CDN 이미지 확인
            const limit = pLimit(3);
            const tasks = Array.from(uniqueHash.entries()).map(([hash, rep]) =>
                limit(async () => {
                    const publicId = `meloudy_imgs/${hash}`;

                    let imageResource: unknown;

                    try {
                        imageResource = await cloudinary.api.resource(
                            publicId,
                            { resource_type: 'image' }
                        );

                        const url = imageResource as CloudinaryResourceLite;
                        const secureUrl = url.secure_url;

                        if (typeof secureUrl === "string") {
                            console.log('이미지 존재함. 재사용');
                            hashToCdn.set(hash, secureUrl);
                        } else if (!secureUrl) {
                            console.log('이미지 존재하지 않음. 업로드 준비');
                            missing.push({ hash, ...rep });
                        }
                    } catch (error: unknown) {
                        if (typeof error === 'object' && error !== null) {
                            const err = error as Record<string, unknown>;

                            const http = err['http_code'] ?? err['status_code'];
                            const inner = err['error'];

                            const innerHttp =
                                (typeof inner === 'object' && inner !== null) ?
                                    (inner as Record<string, unknown>)['http_code'] ??
                                    (inner as Record<string, unknown>)['status_code'] : undefined;

                            const code = // 가능한 http로, 안되면 innerHttp로, 안되면 undefined
                                typeof http === 'number' ? http :
                                    typeof http === 'string' &&
                                        /^\d+$/.test(http) ? Number(http) :
                                        typeof innerHttp === 'number' ? innerHttp :
                                            typeof innerHttp === 'string' &&
                                                /^\d+$/.test(innerHttp) ? Number(innerHttp) :
                                                undefined;

                            if (code === 404) {
                                missing.push({ hash, ...rep });
                                // 존재하지 않으므로 업로드 진행
                            } else {
                                // 404 외 에러는 그대로 실패
                                const msg = (err['message'] as string) ??
                                    (typeof error === 'string' ? error : JSON.stringify(err));
                                throw new Error('CDN 리소스 확인 실패' + `detail: ${msg}`);
                            }
                        } else {
                            // err가 객체가 아니라면 문자열로 안전 반환
                            throw new Error('CDN 리소스 확인 실패' + `detail: ${String(error)}`);
                        }
                    }
                })
            );
            await Promise.all(tasks);

            // CDN 이미지 업로드
            const uploadLimit = pLimit(3);
            const uploadTasks = missing.map((img) => uploadLimit(async () => {
                const finalMime = (img.mime ?? 'image/jpeg').split(';')[0];
                const dataUrl = `data:${finalMime};base64,${img.buffer.toString('base64')}`;

                const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
                    folder: 'meloudy_imgs',
                    resource_type: 'image', // base64 데이터
                    public_id: img.hash, // 중복 업로드 방지.
                    unique_filename: false, // 중복 파일 이름 허용. 중복 시 덮어쓰기 위함
                    overwrite: true,
                    invalidate: false,
                });

                hashToCdn.set(img.hash, uploadResponse.secure_url);
            }));
            await Promise.all(uploadTasks);

            // 이미지 해시 결합
            for (let i = 0; i < toUpload.length; i++) {
                const img = toUpload[i];
                const hash = img.hash;
                if (!hash) {
                    throw new Error(`해시 값이 없습니다.`);
                }

                const url = hashToCdn.get(hash);
                if (!url) {
                    throw new Error(`해시 ${hash.slice(0, 8)}...의 CDN URL이 없습니다.`);
                }

                const idx = img.index;
                finalUrl.push({ index: idx, url });
            }
            // cdnImg가 있을 경우 CDN 이미지도 결합
            if (cdnImg.length > 0) {
                for (let i = 0; i < cdnImg.length; i++) {
                    const img = cdnImg[i];
                    const url = img.url;

                    if (!url) {
                        throw new Error(`CDN 이미지가 없습니다.`);
                    }

                    const idx = img.index;
                    finalUrl.push({ index: idx, url });
                }
            }
            if (finalUrl.length !== sources.length) {
                throw new Error(`이미지 수가 일치하지 않습니다.`);
            }

            // index 정렬
            finalUrl.sort((a, b) => a.index - b.index);

            const $ = cheerio.load(post.content ?? '');

            const contImg = $('img');
            if (contImg.length !== finalUrl.length) {
                return res.status(400).json({
                    message: `본문과 일치하지 않습니다. : 이미지 수 불일치`,
                });
            }

            contImg.each((i, el) => {
                const src = $(el).attr('src') ?? '';

                if (cloudinaryUrl(src)) return; // 이미 CDN 이미지로 입력된 경우

                const changeImg = finalUrl[i]?.url;
                if (!changeImg) throw new Error(`변경 이미지 누락: index=${i}`);

                $(el).attr('src', changeImg);
            });

            finalContent = $('body').html() ?? '';
        }

        const finalPost: PostType = {
            tag: post.tag,
            title: post.title,
            userId: post.userId,
            displayName: post.displayName,
            photoUrl: post.photoUrl,
            content: finalContent,
            thumbnail: finalUrl.length ? finalUrl[0].url : null,
            createAt: Timestamp.now(),
            commentCount: 0,
            notice: post.notice,
        };

        const docRef = await adminDb.collection("posts").add(finalPost);
        const postId = docRef.id;

        const toClientPost = {
            ...finalPost,
            id: postId,
        };

        return res.status(200).json({ post: toClientPost });
    } catch (error) {
        console.error('포스트 업로드 실패', error);
        return res.status(500).json({ message: "포스트 업로드 실패" });
    }
});

export default router;
