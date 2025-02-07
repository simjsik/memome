import { NextRequest, NextResponse } from "next/server";
import { saveGuestSession, saveSession, sessionExists } from "../../utils/redisClient";
import { generateJwt, validateIdToken } from "../validateCsrfToken/route";
import { adminAuth, adminDb } from "@/app/DB/firebaseAdminConfig";

export async function POST(req: NextRequest) {
    try {
        const { idToken, role, hasGuest, guestUid } = await req.json();
        const csrfToken = req.cookies.get("csrfToken")?.value;
        let decodedToken;
        let uid;
        console.log(idToken, role, hasGuest, guestUid)
        if (guestUid) {
            const guestDocRef = adminDb.doc(`guests/${guestUid}`);
            const guestDoc = await guestDocRef.get();
            const guestSessions = await sessionExists(guestUid)

            if (!guestSessions) {
                await guestDocRef.delete();
                console.log('게스트 세션 없음', guestSessions)
            }

            if (!guestDoc.exists) {
                console.log('게스트 로그인 이력 무 : 로직 실행')
                const randomName = `Guest-${Math.random().toString(36).substring(2, 6)}`;

                if (!idToken) {
                    return NextResponse.json({ message: "게스트 토큰이 누락되었습니다." }, { status: 403 });
                }

                decodedToken = await adminAuth.verifyIdToken(idToken);

                uid = decodedToken.uid

                const customToken = await adminAuth.createCustomToken(uid);

                const saveUserResponse = await fetch('http://localhost:3000/api/utils/saveUserProfile/Guest', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid, displayName: randomName, token: customToken }),
                })

                if (!saveUserResponse.ok) {
                    const errorData = await saveUserResponse.json();
                    throw new Error(`${saveUserResponse.status}: ${errorData.error}`);
                }
            } else {
                const idToken = await guestUid.getIdToken();
                if (!idToken) {
                    return NextResponse.json({ message: "게스트 토큰이 유효하지 않습니다." }, { status: 403 });
                }

                decodedToken = await adminAuth.verifyIdToken(idToken);
                if (!decodedToken) {
                    return NextResponse.json({ message: "게스트 계정이 올바르지 않습니다." }, { status: 403 });
                }
                uid = decodedToken.uid
            }
        } else {
            if (!idToken) {
                return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 403 });
            }

            decodedToken = await adminAuth.verifyIdToken(idToken);
            if (!decodedToken) {
                return NextResponse.json({ message: "계정이 올바르지 않습니다." }, { status: 403 });
            }

            uid = decodedToken.uid
        }

        if (!validateIdToken(idToken)) {
            return NextResponse.json({ message: "구글 계정 토큰이 유효하지 않거나 만료되었습니다." }, { status: 403 });
        }

        const userSession = {
            uid: uid,
            name: decodedToken.name || "",
            photo: decodedToken.picture || "",
            email: decodedToken.email || "",
            role: role
        };

        // 서버로 ID 토큰 검증을 위해 전송
        const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
            method: "POST",
            // 이미 토큰을 가져왔으니 여기선 필요 없음!
            body: JSON.stringify({ idToken, csrfToken }),
        });

        if (!csrfResponse.ok) {
            const errorData = await csrfResponse.json();
            console.error("Server-to-server error:", errorData.message);
            return NextResponse.json({ message: "CSRF 토큰 인증 실패." }, { status: 403 });
        }

        const UID = generateJwt(uid, role);

        const response = NextResponse.json({ message: "Token validated", uid, user: userSession });

        if (hasGuest) {
            await saveGuestSession(uid, userSession);
        } else {
            await saveSession(uid, userSession);
        }

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
            sameSite: "strict",
            path: "/",
        });

        // 추가적인 헤더 설정
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");

        return response;
        // 커스텀 토큰 발급
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
