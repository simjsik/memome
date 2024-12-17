import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export default async function handler(req: any, res: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorized");
    }

    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        res.status(200).json({ message: "Authenticated successfully", decodedToken });
    } catch (error) {
        res.status(403).send("Invalid token");
    }
}
