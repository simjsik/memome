export function extractImageUrls(content: string): string[] {
    const imageUrls = [];
    const regex = /<img[^>]+src="([^">]+)"/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        imageUrls.push(match[1]);
    }

    return imageUrls;
}
