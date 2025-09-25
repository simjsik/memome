import admin from "firebase-admin";

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.MY_FIREBASE_PROJECT_ID,
            clientEmail: process.env.MY_FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.MY_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

// Admin SDK 인스턴스 내보내기
export const adminAuth = admin.auth(); // Admin Auth 인스턴스
export const adminDb = admin.firestore(); // Admin Firestore 인스턴스
export const adminStorage = admin.storage(); // Admin Storage 인스턴스
