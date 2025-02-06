import { authenticateUser } from "@/app/api/utils/redisClient";
import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

// Cloudinary에 이미지 업로드 요청
const uploadImgCdn = async (image: string) => {
    const response = await fetch('/api/uploadToCloudinary', {
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
        return data.url;
    } else {
        throw new Error('Image upload failed');
    }
};

const uploadContentImgCdn = async (content: string, uploadedImageUrls: Map<string, string>) => {
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
        const response = await fetch('/api/uploadToCloudinary', {
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

// 포스팅 업로드
export async function POST(req: NextRequest) {
    const { imageUrls, postTitle, posting, selectTag, checkedNotice } = await req.json();

    const userToken = req.cookies.get("userToken")?.value;
    const authToken = req.cookies.get("authToken")?.value;
    let decodedToken; // Firebase 또는 Google에서 디코드된 토큰
    console.log(imageUrls, postTitle, posting, selectTag, checkedNotice, '포스팅 용 데이터')
    console.log(userToken?.slice(0, 8), authToken?.slice(0, 8), '포스팅 용 토큰')
    if (!authToken) {
        return NextResponse.json({ message: "계정 토큰이 존재하지 않습니다." }, { status: 401 });
    }

    // ID 토큰 검증
    if (!userToken) {
        return NextResponse.json({ message: "유저 토큰이 누락되었습니다." }, { status: 403 });
    }

    if (!authenticateUser(userToken)) {
        return NextResponse.json({ message: "유저 토큰이 유효하지 않습니다." }, { status: 403 });
    }

    try {
        decodedToken = await adminAuth.verifyIdToken(authToken); // Firebase 토큰 검증
    } catch (err) {
        console.error("ID 토큰 검증 실패:", err);
        return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
    }

    console.log(decodedToken.uid, '디코드 UID')
    const MAX_IMG_COUNT = 4
    const title_limit_count = 20
    const content_limit_count = 2500

    if (imageUrls.length > MAX_IMG_COUNT) {
        alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 업로드 가능합니다.`)
        return;
    }
    if (postTitle.length > title_limit_count) {
        alert(`제목을 20자 이내로 작성해 주세요.`)
        return;
    }
    if (posting.length > content_limit_count) {
        alert(`최대 2500자의 내용만 작성 가능합니다.`)
        return;
    }

    if (postTitle && posting) {
        try {
            // 업로드된 이미지 URL을 추적하기 위한 Map 생성
            const uploadedImageUrls = new Map<string, string>();

            // imageUrls 최적화 및 업로드
            const optImageUrls = await Promise.all(
                imageUrls.map(async (image: string) => {
                    const cloudinaryUrl = await uploadImgCdn(image);
                    uploadedImageUrls.set(image, cloudinaryUrl); // 업로드된 URL을 Map에 저장
                    return cloudinaryUrl;
                })
            );

            // content 내 이미지 URL을 최적화된 URL로 교체
            const optContentUrls = await uploadContentImgCdn(posting, uploadedImageUrls);

            // Firestore에 데이터 추가 (Admin SDK 사용)
            await adminDb.collection("posts").add({
                tag: selectTag,
                title: postTitle,
                userId: decodedToken.uid, // uid로 사용자 ID 사용
                content: optContentUrls,
                images: optImageUrls ? false : optImageUrls,
                createAt: Timestamp.now(),
                commentCount: 0,
                notice: checkedNotice,
            });

            return NextResponse.json({
                message: "포스트 업로드 성공",
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                return NextResponse.json({ message: "포스팅에 실패하였습니다" }, { status: 403 });

            } else {
                return NextResponse.json({ message: "포스팅에 실패하였습니다" }, { status: 403 });
            }
        }
    }
}
