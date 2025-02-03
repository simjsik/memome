import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, getSession, updateSession } from "../redisClient";
import { validateIdToken } from "../../auth/validateCsrfToken/route";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, name } = body;

        const authToken = req.cookies.get("authToken")?.value;
        const userToken = req.cookies.get("userToken")?.value;

        let decodedToken: any; // Firebase 또는 Google에서 디코드된 토큰
        let userData: any;     // Redis에서 가져온 유저 데이터

        if (!authToken) {
            return NextResponse.json({ message: "계정 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!userToken) {
            return NextResponse.json({ message: "유저 토큰이 존재하지 않습니다." }, { status: 401 });
        }

        if (!authenticateUser(userToken)) {
            return NextResponse.json({ message: "유저 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        if (!validateIdToken(authToken)) {
            return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        try {
            decodedToken = await adminAuth.verifyIdToken(authToken); // Firebase 토큰 검증
        } catch (err) {
            console.error("ID 토큰 검증 실패:", err);
            return NextResponse.json({ message: "ID 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const UID = decodedToken.uid
        // UID를 기반으로 Redis에서 세션 조회
        try {
            userData = await getSession(decodedToken.uid); // Redis에서 세션 가져오기
            console.log(userData, '유저 세션 데이터')
            if (!userData) {
                return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
            }
        } catch (err) {
            console.error("Redis 세션 조회 실패:", err);
            return NextResponse.json({ message: "유저 세션이 만료되었거나 유효하지 않습니다." }, { status: 403 });
        }

        let profileImageUrl = null

        // 변경된 이미지가 있을 시 업데이트
        if (image) {
            // 받아온 image인자가 File 타입이기 때문에 Cloudinary에 저장을 위해 base64로 변경
            const response = await fetch('/api/uploadToCloudinary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: image }),
            });

            if (!response.ok) {
                return NextResponse.json({ message: "프로필 사진 업로드 실패! :" }, { status: 403 });
            }

            const data = await response.json();
            if (data.url) {
                profileImageUrl = data.url;
            } else {
                return NextResponse.json({ message: "Cloudinary의 이미지 반환 실패" }, { status: 403 });
            }
        } else {
            profileImageUrl = userData.photo;
        }

        // Firebase Authentication의 프로필 업데이트
        await adminAuth.updateUser(UID, {
            displayName: name,
            photoURL: profileImageUrl,
        });

        // 업데이트한 프로필 Firestore에 저장
        const docRef = adminDb.doc(`users/${UID}`);
        await docRef.update(
            {
                displayName: name,
                photoURL: profileImageUrl
            },
        );

        const userSession = {
            uid: UID,
            name: name,
            photo: profileImageUrl,
            email: userData.email,
            role: userData.role,
        };

        updateSession(UID, userSession)
        // 사용자 정보 반환
        return NextResponse.json({
            message: "프로필 업데이트 성공",
        });
    } catch (error) {
        console.error('프로필 사진 업로드에 실패: ' + error);
        return NextResponse.json({ message: "프로필 사진 업로드에 실패" }, { status: 401 });
    }
}
