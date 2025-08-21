export const uploadImgCdn = async (image: string) => {
    const response = await fetch(`/api/cloudinary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
    });

    if (!response.ok) {
        throw new Error('이미지 업로드 실패')
    }

    const data = await response.json();
    if (data.url) {
        return { imgUrl: data.url };
    } else {
        throw new Error('이미지 업로드 실패 : 이미지 URL 없음');
    }
};

export const uploadContentImgCdn = async (
    content: string,
    uploadedImageUrls: Map<string, string>,
) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const imgElements = Array.from(doc.querySelectorAll('img'));

    // 고유 URL만 처리
    const uniqueUrls = Array.from(
        new Set(imgElements.map((img) => img.getAttribute('src') ?? ''))
    ).filter(Boolean) as string[];

    // 결과 저장 값
    const results: Array<{ originalUrl: string; success: boolean; cdnUrl?: string; error?: string }> = [];

    for (const originalUrl of uniqueUrls) {
        const cdn = uploadedImageUrls.get(originalUrl);
        if (typeof cdn === 'string') { // 포스트 이미지와 일치하는 URL이 있다면
            results.push({ originalUrl, success: true, cdnUrl: cdn });
        } else {
            results.push({ originalUrl, success: false, error: '포스트 이미지 찾기 실패' });
        }
    }

    const resultsMap = new Map(results.map(r => [r.originalUrl, r]));

    for (const image of imgElements) {

        const src = image.getAttribute('src');

        if (src) {
            const findImg = resultsMap.get(src);
            if (!findImg) continue;

            if (findImg.success && findImg.cdnUrl) {
                image.setAttribute('src', findImg.cdnUrl);
            } else {

            }
        } else { image.setAttribute('data-upload-status', 'img_undefined') }
    }
    // 5) 최종 HTML 반환
    return { content: doc.body.innerHTML, results };
};