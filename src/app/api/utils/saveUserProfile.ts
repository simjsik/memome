import { adminAuth } from "@/app/DB/firebaseAdminConfig";
import { db } from "@/app/DB/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function saveNewUser(uid: string, displayName: string | null = null) {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
        const randomName = `user${Math.random().toString(36).substring(2, 10)}`;
        const setDisplay = displayName ? displayName : randomName

        await setDoc(userRef, {
            setDisplay,
            photoURL: "",
            userId: uid,
        });

        console.log(`New user created: ${setDisplay}`);
    }
}

export async function saveNewGoogleUser(uid: string, displayName: string | null, photoURL: string | null) {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
        const randomName = `user${Math.random().toString(36).substring(2, 10)}`;
        await setDoc(userRef, {
            displayName: displayName || randomName,
            photoURL: photoURL || "",
            userId: uid,
        });
        console.log(`New user created: ${randomName}`);
    }
}

export async function saveNewGuest(uid: string, displayName: string | null, token: string) {
    const guestRef = doc(db, "guests", uid);
    const guestSnapshot = await getDoc(guestRef);
    if (!guestSnapshot.exists()) {
        const randomName = `Guest-${Math.random().toString(36).substring(2, 10)}`;

        await setDoc(guestRef, {
            displayName: displayName || randomName,
            photoURL: "",
            userId: uid,
            token: token
        });
    }
}