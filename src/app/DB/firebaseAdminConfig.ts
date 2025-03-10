import admin from "firebase-admin";

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.split(String.raw`\n`).join('\n')
        }),
    });
}
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.split(String.raw`\n`).join('\n');
console.log("Private Key Preview:", privateKey?.slice(0, 50) + "..."); // 처음 50자만 출력
// Admin SDK 인스턴스 내보내기
export const adminAuth = admin.auth(); // Admin Auth 인스턴스
export const adminDb = admin.firestore(); // Admin Firestore 인스턴스
export const adminStorage = admin.storage(); // Admin Storage 인스턴스
