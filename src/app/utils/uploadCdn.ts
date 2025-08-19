export const uploadImgCdn = async (image: string) => {
    const response = await fetch(`/api/cloudinary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
    });

    if (!response.ok) {
        throw new Error('image upload failed')
    }

    const data = await response.json();
    if (data.url) {
        return { imgUrl: data.url };
    } else {
        throw new Error('Image upload failed');
    }
};

export const uploadContentImgCdn = async (
    content: string, uploadedImageUrls: Map<string, string>,
    options?: { retry?: number; timeoutMs?: number; placeholderOnFail?: string | null }
) => {
    const { retry = 1, timeoutMs = 15000, placeholderOnFail = null } = options ?? {};

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const imgElements = Array.from(doc.querySelectorAll('img'));

    // 고유 URL만 처리
    const uniqueUrls = Array.from(
        new Set(imgElements.map((img) => img.getAttribute('src') ?? ''))
    ).filter(Boolean) as string[];


    const fetchImage = async (url: string) => {

        const attempt = async (triesLeft: number): Promise<{ cdnUrl?: string; error?: string }> => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            try {
                // Cloudinary에 이미지 업로드
                const response = await fetch(`/api/cloudinary`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: url }),
                });

                clearTimeout(timer);

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`${error.message} : ${error.status}`);
                }

                const image = await response.json() as { url: string } | null;
                if (image?.url) return { cdnUrl: image.url };

                return { error: '이미지 변경 없음' };
            } catch (error: unknown) {
                clearTimeout(timer);
                if (error instanceof Error) {
                    const errMsg = error instanceof Error ? error.message : String(error ?? '알 수 없는 오류');
                    console.error('네트워크/타임아웃 오류:', errMsg);
                    if (triesLeft <= 1) return { error: errMsg };
                };
                // 지수 백오프
                const backoffMs = 300 * Math.pow(2, (retry - triesLeft));
                await new Promise((r) => setTimeout(r, backoffMs));
                return attempt(triesLeft - 1);
            }
        }

        return attempt(retry);
    }

    // 3) 각 고유 URL에 대해 업로드/캐시 처리
    const results = await Promise.all(
        uniqueUrls.map(async (originalUrl) => {
            if (uploadedImageUrls.has(originalUrl)) {
                return { originalUrl, success: true, cdnUrl: uploadedImageUrls.get(originalUrl) };
            }
            const { cdnUrl, error } = await fetchImage(originalUrl);
            if (cdnUrl) uploadedImageUrls.set(originalUrl, cdnUrl);
            return { originalUrl, success: !!cdnUrl, cdnUrl, error };
        })
    );

    // 4) DOM에서 직접 해당 img들의 src 수정 또는 실패 표기
    for (const r of results) {
        imgElements.forEach((img) => {
            const src = img.getAttribute('src') ?? '';
            if (src !== r.originalUrl) return;

            if (r.success && r.cdnUrl) {
                img.setAttribute('src', r.cdnUrl);
            } else {
                img.setAttribute('데이터 업로드 실패.', r.error ?? '이미지 업로드 실패');
                if (placeholderOnFail) img.setAttribute('src', placeholderOnFail);
            }
        });
    }

    // 5) 최종 HTML 반환
    return { content: doc.body.innerHTML, results };
};