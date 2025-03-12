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

router.post('/cloudinary', async (req: Request, res: Response) => {
    try {
        const {image} = await req.body;

        // 데이터 형식 확인
        if (!image || !image.startsWith('data:image/')) {
            console.error("Invalid image data format:", image);
            return res.status(400).json({message: "이미지 포맷에 실패했습니다."});
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

        return res.status(200).json({url: uploadResponse.secure_url});
    } catch (error) {
        console.error('Cloudinary 업로드 실패', error);
        return res.status(500).json({message: "Cloudinary 업로드 실패"});
    }
});

export default router;
