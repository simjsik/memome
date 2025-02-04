import { adminDb } from "@/app/DB/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { uid, displayName, token, photoURL } = await req.json();

    try {
        const userRef = adminDb.doc(`guests/${uid}`);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            const randomName = `Guest-${Math.random().toString(36).substring(2, 10)}`;

            await userRef.set({
                displayName: displayName || randomName,
                photoURL: photoURL || "",
                userId: uid,
                token: token
            })

            console.log(`New Guest user created: ${uid}`);
        }

        return NextResponse.json({ message: "게스트 유저 정보 저장" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "게스트 유저 정보 저장 실패" + error }, { status: 403 });
    }
}