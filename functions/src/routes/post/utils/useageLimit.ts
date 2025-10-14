import { adminDb } from "../../../DB/firebaseAdminConfig";
import admin from 'firebase-admin';

// eslint-disable-next-line require-jsdoc
function todayUtcKey(): string {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// eslint-disable-next-line require-jsdoc
export async function usageLimit(user: string) {
    const limitCount = 80;

    const today = todayUtcKey();

    // Firestore에서 문서 참조 얻기
    const userDocRef = adminDb.doc(`userUsage/${user}`);

    return adminDb.runTransaction(async (tx) => {
        const userDocSnap = await tx.get(userDocRef);

        const userDoc = userDocSnap.data() as {
            readCount: number, lastUpdate: string
        };

        if (!userDocSnap.exists) {
            tx.set(userDocRef, { readCount: 1, lastUpdate: today });
            return true;
        }

        const { readCount, lastUpdate } = userDoc;

        const base = (lastUpdate === today) ? (readCount ?? 0) : 0;

        if (base >= limitCount) return false;

        tx.set(userDocRef, {
            readCount: base + 1,
            lastUpdate: today,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return true;
    });
}
