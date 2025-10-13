// eslint-disable-next-line require-jsdoc
function parseDataUrl(dataUrl: string): { mime: string; base64: string } | null {
    const mimes = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!mimes) return null;

    return { mime: mimes[1], base64: mimes[2] };
}

// eslint-disable-next-line require-jsdoc
async function fetchBufferFromUrl(url: string, timeoutMs = 10000):
    Promise<{ buffer: Buffer; mime?: string }> {
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const resp = await fetch(url, { signal: controller.signal });

        if (!resp.ok) throw new Error(`리모트 가져오기 실패 ${resp.status}`);

        const contentType = resp.headers.get('content-type') ?? undefined;

        const arrayBuffer = await resp.arrayBuffer();

        const normalized = contentType?.split(';')[0];
        return {
            buffer: Buffer.from(arrayBuffer), mime: normalized,
        };
    } finally {
        clearTimeout(timer);
    }
}

// eslint-disable-next-line require-jsdoc
export function cloudinaryUrl(src: string): boolean {
    const cdn = /^https?:\/\/res\.cloudinary\.com\/.+\/image\/upload\/.+\/meloudy_imgs\//.test(src);
    return cdn;
}

type ImageCheckResult =
    | { kind: 'cdn'; finalUrl: string }
    | { kind: 'resolved'; buffer: Buffer; mime?: string }

// eslint-disable-next-line require-jsdoc
export async function imageCheck(img: string): Promise<ImageCheckResult> {
    if (!img || typeof img !== 'string') {
        throw new Error('빈 이미지 소스');
    }

    if (cloudinaryUrl(img)) {
        return { kind: 'cdn', finalUrl: img };
    }

    const isDataUrl = (s: string) => s.startsWith('data:');
    const isHttpUrl = (s: string) => /^https?:\/\//i.test(s);

    try {
        if (isDataUrl(img)) {
            const parsed = parseDataUrl(img);
            if (!parsed) throw new Error('data URL 파싱 실패');
            return {
                kind: 'resolved',
                buffer: Buffer.from(parsed.base64, 'base64'),
                mime: parsed.mime,
            };
        }

        if (isHttpUrl(img)) {
            const remote = await fetchBufferFromUrl(img, 10000);
            return { kind: 'resolved', buffer: remote.buffer, mime: remote.mime };
        }

        throw new Error('지원하지 않는 이미지 스킴(허용: data:, http(s):)');
    } catch (err: unknown) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error('이미지 가져오기 실패', detail);
        throw new Error(`이미지 가져오기 실패: ${detail}`);
    }
}
