import { adminDb } from "@/app/DB/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { uid, displayName, photoURL } = await req.json();

    try {
        const userRef = adminDb.doc(`users/${uid}`);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            const randomName = `user${Math.random().toString(36).substring(2, 10)}`;

            await userRef.set({
                displayName: displayName || randomName,
                photoURL: photoURL || "",
                userId: uid,
            });

            console.log(`New Google user created: ${uid}`);
        }

        return NextResponse.json({ message: "구글 유저 정보 저장" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "구글 유저 정보 저장 실패" }, { status: 403 });
    }
}