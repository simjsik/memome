import {v2 as cloudinary} from "cloudinary";
import crypto from "crypto"; // SHA-1 해시 생성용
import express, {Request, Response} from "express";

// Cloudinary 설정
cloudinary.config({
    cloud_name: process.env.MY_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.MY_CLOUDINARY_API_KEY,
    api_secret: process.env.MY_CLOUDINARY_API_SECRET,
});

const router = express.Router();

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES =
new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

// eslint-disable-next-line require-jsdoc
function parseDataUrl(dataUrl: string):
{ mime: string; base64: string } | null {
  const mimes = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!mimes) return null;

  return {mime: mimes[1], base64: mimes[2]};
}

// eslint-disable-next-line require-jsdoc
async function fetchBufferFromUrl(url: string, timeoutMs = 10000):
    Promise<{ buffer: Buffer; mime?: string }> {
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const resp = await fetch(url, {signal: controller.signal});

        if (!resp.ok) throw new Error(`리모트 가져오기 실패 ${resp.status}`);

        const contentType = resp.headers.get('content-type') ?? undefined;

        const arrayBuffer = await resp.arrayBuffer();

        return {
            buffer: Buffer.from(arrayBuffer), mime: contentType ?? undefined,
        };
    } finally {
        clearTimeout(timer);
    }
}

router.post('/cloudinary', async (req: Request, res: Response) => {
    const {image} = req.body as { image?: string };
    try {
        if (!image || typeof image !== 'string') {
            return res.status(400).json({
                message: '허용되지 않은 이미지 URL 입니다.',
            });
        }

        let buffer: Buffer;
        let mime: string | undefined;

        const parsed = parseDataUrl(image);

        if (parsed) {
            mime = parsed.mime;
            buffer = Buffer.from(parsed.base64, 'base64');
        } else {
            // 외부 URL 처리
            try {
                const remote = await fetchBufferFromUrl(image, 10000);
                buffer = remote.buffer;
                mime = remote.mime;
            } catch (err: unknown) {
                const detail = err instanceof Error ? err.message : String(err);
                console.error('외부 이미지 fetch 실패', detail);
                return res.status(400).json({
                    message: '외부 이미지 가져오기 실패', detail,
                });
            }
        }

        // MIME & size 검사
        if (mime && !ALLOWED_MIMES.has(mime)) {
            return res.status(415).json({message: '지원하지 않는 타입', mime});
        }
        if (buffer.length > MAX_BYTES) {
            return res.status(413).json(
                {message: '이미지 사이즈 초과', bytes: buffer.length}
            );
        }

        // 이미지 해시 생성
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        let imageResource: string | unknown = undefined;
        const publicId = `meloudy_imgs/${hash}`;

        try {
            imageResource = await cloudinary.api.resource(
                publicId,
                {resource_type: 'image'}
            );
        } catch (error : unknown) {
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
                    imageResource = undefined;
                    // 존재하지 않으므로 업로드 진행
                } else {
                    // 404 외 에러는 그대로 실패
                    const msg = (err['message'] as string) ??
                     (typeof error === 'string' ? error : JSON.stringify(err));
                    return res.status(500).json(
                        {message: 'CDN 리소스 확인 실패', detail: msg}
                    );
                }
            } else {
                    // err가 객체가 아니라면 문자열로 안전 반환
                    return res.status(500).json({
                         message: 'CDN 리소스 확인 실패', detail: String(error),
                    });
            }
        }

        // --- 5) 있으면 재사용
        if (typeof imageResource === 'object' && imageResource !== null) {
            const image = imageResource as Record<string, unknown>;
            const url = image['secure_url'];
            if (typeof url === 'string') {
                return res.status(200).json({url, existed: false});
            }
        }

        // --- 6) 업로드 (버퍼 -> dataURI)
        const finalMime = mime ?? 'image/jpeg';
        const dataUrl = `data:${finalMime};base64,${buffer.toString('base64')}`;

        // CDN 업로드
        const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
            folder: 'meloudy_imgs',
            resource_type: 'image', // base64 데이터임을 명확히 전달
            public_id: hash, // 중복 업로드 방지.
            unique_filename: false, // 중복 파일 이름 허용 ** 중복 시 덮어쓰기 하기 위함
            overwrite: true,
            invalidate: false,
        });

        return res.status(200).json({
            url: uploadResponse.secure_url, existed: false,
        });
    } catch (error) {
        console.error('Cloudinary 업로드 실패', error);
        return res.status(500).json({message: "Cloudinary 업로드 실패"});
    }
});

export default router;
