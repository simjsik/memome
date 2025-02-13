import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";
import { getSession, updateSession } from "@/app/utils/redisClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, name, uid } = body;

        const userData = await getSession(uid);
        if (!userData) {
            return NextResponse.json(
                {
                    message: "유저 세션 정보가 존재하지 않습니다."
                },
                { status: 403 }
            );
        }

        // Firebase Authentication의 프로필 업데이트
        await adminAuth.updateUser(uid, {
            displayName: name,
            photoURL: image || userData.photo,
        });

        // 업데이트한 프로필 Firestore에 저장
        const docRef = adminDb.doc(`users/${uid}`);
        await docRef.update(
            {
                displayName: name,
                photoURL: image || userData.photo
            },
        );

        const userSession = {
            uid: uid,
            name: name,
            photo: image || userData.photo,
            email: userData.email,
            role: userData.role,
        };

        updateSession(uid, userSession)
        // 사용자 정보 반환
        return NextResponse.json({
            message: "프로필 업데이트 성공",
        });
    } catch (error) {
        console.error('프로필 사진 업로드에 실패: ' + error);
        return NextResponse.json({ message: "프로필 사진 업로드에 실패" }, { status: 403 });
    }
}
