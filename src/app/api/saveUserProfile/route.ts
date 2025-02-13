import { adminDb } from "@/app/DB/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

export interface newUser {
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
    uid: string;
    token?: string;
}

export async function POST(req: NextRequest) {
    const { uid, displayName, email, token, photoURL } = await req.json();
    let randomName
    let userRef
    try {
        userRef = adminDb.doc(`users/${uid}`);
        randomName = `user-${Math.random().toString(36).substring(2, 10)}`;

        if (token) {
            userRef = adminDb.doc(`guests/${uid}`);
            randomName = `Guest-${Math.random().toString(36).substring(2, 10)}`;
        }

        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {

            const userData: newUser = {
                displayName: displayName || randomName,
                photoURL: photoURL || "",
                email: email,
                uid: uid,
            };

            if (token) {
                userData.token = token;
            }

            await userRef.set(userData);
            console.log(`New Firebase user created: ${uid}`);
        }

        return NextResponse.json({ message: "유저 정보 저장" }, { status: 200 });
    } catch (error) {
        if (error) {
            return NextResponse.json({ message: "유저 정보 저장 실패" + error }, { status: 403 });
        }
        return NextResponse.json({ message: "유저 정보 저장 실패" }, { status: 403 });
    }
}