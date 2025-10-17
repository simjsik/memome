import { Request, Response, Router } from "express";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { adminAuth, adminDb } from "../DB/firebaseAdminConfig";
import jwt from 'jsonwebtoken';
import { Timestamp } from "firebase-admin/firestore";

const router = Router();

const SECRET = process.env.JWT_SECRET;
const CSRF_SECRET = process.env.CSRF_SECRET;
const ACCESS_EXPIRES_MS = 60 * 60 * 1000;
const REFRESH_EXPIRES_DAYS = 30;
const REFRESH_MAX_AGE_MS = REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

/**
 * @param {FirebaseFirestore.Transaction} tx
 * @param {string} uid
 * @return {Promise<void>}
 */
export async function revokeSessionsTx(
    tx: FirebaseFirestore.Transaction,
    uid: string
): Promise<void> {
    const sessionsQuery = adminDb.collection('sessions').where('uid', '==', uid);
    const sessionsSnap = await tx.get(sessionsQuery);

    for (const doc of sessionsSnap.docs) {
        const sessionHash = doc.id;
        tx.update(doc.ref,
            {
                revoked: true,
                revokedAt: Timestamp.now(),
            });

        const tokenRef = adminDb.doc(`refreshTokens/${uid}/session/${sessionHash}`);
        tx.set(tokenRef,
            {
                revoked: true,
                revokedAt: Timestamp.now(),
            },
            { merge: true });
    }
}

router.post('/refresh', async (req: Request, res: Response) => {
    const clientOrigin = req.headers["project-host"] || req.headers.origin;
    const isProduction = clientOrigin?.includes("memome-delta.vercel.app");

    try {
        const refreshToken = req.cookies.refreshToken;
        const sessionId = req.cookies.session;
        const { idToken } = req.body;

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken) {
            return res.status(401).json({ mseaage: '계정 토큰이 올바르지 않습니다' });
        }

        if (!refreshToken || !sessionId) {
            return res.status(401).json({ error: '토큰 또는 세션 확인 불가.' });
        }

        const sessionHash =
            createHash("sha256").update(sessionId).digest("hex");
        const sessionDocRef =
            adminDb.doc(`sessions/${sessionHash}`);

        const transaction = await adminDb.runTransaction(async (tx) => {
            const sessionSnap = await tx.get(sessionDocRef);

            if (!sessionSnap.exists) {
                throw new Error('세션 확인 불가');
            }

            const session = sessionSnap.data();
            if (!session) {
                throw new Error('세션 확인 불가');
            }

            if (session.expiresAt &&
                session.expiresAt.toMillis() <= Date.now()
            ) throw new Error('세션 만료');

            if (session.revoked) throw new Error('세션 무효 됨');

            const uid = session.uid;

            const refreshHash = createHash("sha256").update(refreshToken).digest("hex");

            const tokenDocRef =
                adminDb.doc(`refreshTokens/${uid}/session/${sessionHash}`);

            const userDocRef = session.guest ? adminDb.doc(`guests/${uid}`) : adminDb.doc(`users/${uid}`);
            const userSnap = await tx.get(userDocRef);
            if (!userSnap.exists) {
                throw new Error('유저 확인 불가');
            }

            const jti = randomBytes(16).toString('hex');

            const newRefreshId = randomBytes(32).toString("hex");
            const newRefreshHash =
                createHash("sha256").update(newRefreshId).digest("hex");

            const tokenSnap = await tx.get(tokenDocRef);
            if (!tokenSnap.exists) {
                throw Error('갱신 토큰 확인 불가');
            }

            const tokenData = tokenSnap.data();
            if (!tokenData) {
                throw Error('갱신 토큰 확인 불가');
            }

            if (tokenData.expiresAt &&
                tokenData.expiresAt.toMillis() <= Date.now()) {
                throw new Error('갱신 토큰 만료');
            }

            if (tokenData.revoked) throw new Error('토큰 무효 됨');

            const currentHashHex: string = tokenData.currentHash;
            const prevHashHex: string | undefined = tokenData.prevHash;

            const presentedBuf = Buffer.from(refreshHash, "hex");

            if (currentHashHex) {
                const currentBuf = Buffer.from(currentHashHex, "hex");
                if (presentedBuf.length === currentBuf.length &&
                    timingSafeEqual(presentedBuf, currentBuf)) {
                    const now = Timestamp.now();
                    const newExpiresAt = Timestamp.fromMillis(Date.now() + REFRESH_MAX_AGE_MS);

                    tx.update(tokenDocRef, {
                        prevHash: currentHashHex ?? null,
                        currentHash: newRefreshHash,
                        lastAt: now,
                        expiresAt: newExpiresAt,
                        userAgent: req.headers["user-agent"] ?? null,
                        ip: (req.headers["x-forwarded-for"] ??
                            req.socket.remoteAddress) as string | undefined,
                        revoked: false,
                    });

                    tx.update(sessionDocRef, {
                        expiresAt: newExpiresAt,
                        lastAt: now,
                    });
                    return { uid, jti, newRefreshId }; // 성공
                }
            } else {
                throw new Error("갱신 토큰 확인 불가");
            }

            if (prevHashHex) {
                const prevBuf = Buffer.from(prevHashHex, "hex");
                if (presentedBuf.length === prevBuf.length &&
                    timingSafeEqual(presentedBuf, prevBuf)) {
                    await revokeSessionsTx(tx, uid);
                    throw new Error("갱신 토큰 재사용 감지");
                }
            }

            throw new Error("유효하지 않은 갱신 토큰");
        });

        const { uid, jti, newRefreshId } = transaction;

        const payload = { uid, jti };

        const admin = decodedToken.roles?.admin === true;
        const hasGuest = decodedToken.roles?.hasGuest === true;

        if (!SECRET || !CSRF_SECRET) {
            console.error("JWT 비밀 키 확인 불가");
            return res.status(401).json({ message: "JWT 비밀 키 확인 불가" });
        }

        const refreshUserToken = jwt.sign({ ...payload, admin, hasGuest }, SECRET, { expiresIn: '1h' });
        const refreshCsrfToken = jwt.sign(
            { ...payload, nonce: randomBytes(32).toString("hex"), type: 'csrf' },
            CSRF_SECRET,
            { expiresIn: '1h' },
        );
        const refreshRfToken = jwt.sign(
            {
                ...payload,
                sid: sessionHash,
                nonce: randomBytes(32).toString("hex"),
                type: 'refresh',
            },
            CSRF_SECRET,
            { expiresIn: '30d' },
        );

        const cookieUser = {
            httpOnly: true,
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: ACCESS_EXPIRES_MS,
        };

        const cookieCsrf = {
            httpOnly: false,
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: ACCESS_EXPIRES_MS,
        };

        const cookieRefreshCsrf = {
            httpOnly: false,
            domain: isProduction ? "memome-delta.vercel.app" : undefined,
            secure: isProduction,
            sameSite: "lax" as const,
            path: "/",
            maxAge: REFRESH_MAX_AGE_MS,
        };

        const cookieRefresh = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: REFRESH_MAX_AGE_MS,
        };

        return res
            .cookie("userToken", refreshUserToken, cookieUser)
            .cookie("csrfToken", refreshCsrfToken, cookieCsrf)
            .cookie("refreshToken", newRefreshId, cookieRefresh)
            .cookie("refreshCsrfToken", refreshRfToken, cookieRefreshCsrf)
            .status(200)
            .json({ message: '토큰 갱신 완료' });
    } catch (error: unknown) {
        console.error("갱신 에러:", error);
        if (error instanceof Error) {
            if (error.message === "갱신 토큰 확인 불가" || error.message === "유효하지 않은 갱신 토큰") {
                return res.status(401).json({ message: "갱신 토큰이 유효하지 않음" });
            }
            if (error.message === "갱신 토큰 재사용 감지") {
                return res.status(401).json({ message: "토큰 재사용 - 모든 세션 제거" });
            }
            if (error.message === "유저 확인 불가") {
                return res.status(401).json({ message: "유저 확인 불가" });
            }
        }
        return res.status(500).json({ message: "토큰 갱신 실패" });
    }
});

export default router;
