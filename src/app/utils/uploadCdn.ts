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
        return { imgUlr: data.url };
    } else {
        throw new Error('Image upload failed');
    }
};

export const uploadContentImgCdn = async (content: string, uploadedImageUrls: Map<string, string>) => {
    const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
    let updatedContent = content;
    let match;

    // img 태그 추출
    while ((match = imgTagRegex.exec(content)) !== null) {
        const originalUrl = match[1];

        // 이미 업로드된 이미지인지 확인
        if (uploadedImageUrls.has(originalUrl)) {
            // 이미 업로드된 이미지 URL로 교체
            updatedContent = updatedContent.replace(originalUrl, uploadedImageUrls.get(originalUrl)!);
            continue;
        }

        // Cloudinary에 이미지 업로드
        const response = await fetch(`/api/cloudinary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: originalUrl }),
        });

        if (!response.ok) {
            console.error('콘텐츠 이미지 업로드 실패', originalUrl);
            continue;
        }

        const data = await response.json();

        // Cloudinary URL이 있다면 content의 이미지 URL 교체 및 URL 캐싱
        if (data.url) {
            uploadedImageUrls.set(originalUrl, data.url);
            updatedContent = updatedContent.replace(originalUrl, data.url);
        }
    }

    return updatedContent;
};