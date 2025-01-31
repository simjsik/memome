import { NextRequest, NextResponse } from "next/server";
import { saveGuestSession, saveSession } from "../../utils/redisClient";
import { generateJwt } from "../validateCsrfToken/route";
import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/DB/firebaseConfig";
import { signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { saveNewGuest } from "../../utils/saveUserProfile";

export async function POST(req: NextRequest) {
    try {
        const { hasGuest, guestUid } = await req.json();

        let user: any;
        let idToken: any;
        let uid = guestUid;
        let decodedToken: any;
        let role = 1
        const randomName = `Guest-${Math.random().toString(36).substring(2, 10)}`;

        let guestSession = {
            uid: uid,
            name: "",
            photo: "",
            email: "",
            role: role
        };

        if (!guestUid || guestUid === 'undefined') {
            const userCredential = await signInAnonymously(auth);

            if (!userCredential) {
                return NextResponse.json({ message: "게스트 로그인에 실패했습니다." }, { status: 403 });
            }

            user = userCredential.user

            idToken = await user.getIdToken();

            if (!idToken) {
                return NextResponse.json({ message: "게스트 토큰이 누락되었습니다." }, { status: 403 });
            }

            decodedToken = await adminAuth.verifyIdToken(idToken);

            uid = decodedToken.uid
            console.error('게스트 로그인 이력 무 : 로직 실행')
        }

        const guestDoc = await getDoc(doc(db, "guests", uid));

        if (!guestDoc.exists()) {
            const customToken = await adminAuth.createCustomToken(uid);

            guestSession = {
                uid: uid,
                name: randomName || "",
                photo: "",
                email: "",
                role: role
            };

            saveNewGuest(uid, randomName, customToken)
        } else {
            const customToken = guestDoc.data().token;
            console.log(customToken, '게스트 커스텀 토큰')

            const userCredential = await signInWithCustomToken(auth, customToken);
            if (!userCredential) {
                return NextResponse.json({ message: "게스트 로그인에 실패했습니다." }, { status: 403 });
            }

            user = userCredential.user
            console.error(userCredential, '게스트 유저 정보')
            idToken = await user.getIdToken();
            if (!idToken) {
                return NextResponse.json({ message: "게스트 토큰이 누락되었습니다." }, { status: 403 });
            }

            decodedToken = await adminAuth.verifyIdToken(idToken);

            uid = decodedToken.uid

            guestSession = {
                uid: uid,
                name: guestDoc.data().displayName || "",
                photo: guestDoc.data().photoURL,
                email: '',
                role: role
            };
            console.error('게스트 로그인 이력 유 : 로직 실행')
        }

        const csrfToken = req.cookies.get("csrfToken")?.value;

        // 서버로 ID 토큰 검증을 위해 전송
        const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
            method: "POST",
            // 이미 토큰을 가져왔으니 여기선 필요 없음!
            body: JSON.stringify({ idToken, csrfToken }),
        });
        if (!csrfResponse.ok) {
            const errorData = await csrfResponse.json();
            console.error("CSRF 토큰 인증 실패:", errorData.message);
            return NextResponse.json({ message: "CSRF 토큰 인증 실패." }, { status: 411 });
        }
        
        const UID = generateJwt(uid, role);

        const response = NextResponse.json({ message: "Token validated", uid });

        await saveGuestSession(uid, guestSession); // Redis에 세션 저장

        response.cookies.set("authToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        response.cookies.set("userToken", UID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        response.cookies.set("hasGuest", hasGuest, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: "/",
        });

        // 추가적인 헤더 설정
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");

        return response;
    } catch (error) {
        console.error("Login error:", error);
        if (error === "auth/user-not-found") {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        } else if (error === "auth/wrong-password") {
            return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
        }
        return NextResponse.json({ message: "Login failed" }, { status: 500 });
    }
}
