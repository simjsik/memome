import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto"; // SHA-1 해시 생성용

// Cloudinary 설정
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        // 데이터 형식 확인
        if (!image || !image.startsWith('data:image/')) {
            console.error("Invalid image data format:", image);
            return NextResponse.json({ error: 'Invalid image data format' }, { status: 400 });
        }

        // 이미지 해시 생성
        const hash = crypto.createHash('sha1').update(image).digest('hex');

        // CDN 업로드
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'meloudy_imgs',
            resource_type: 'image', // base64 데이터임을 명확히 전달
            public_id: hash, // 중복 업로드 방지.
            unique_filename: false, // 중복 파일 이름 허용 ** 중복 시 덮어쓰기 하기 위함
            overwrite: true,
        });

        return NextResponse.json({ url: uploadResponse.secure_url });
    } catch (error) {
        console.error('Cloudinary upload Failed', error)
        return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
    }
}
