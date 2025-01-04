import { db } from "@/app/DB/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function saveNewUser(uid: string) {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    console.log(userSnapshot.exists(), '유저 데이터 확인')
    if (!userSnapshot.exists()) {
        const randomName = `user${Math.random().toString(36).substring(2, 10)}`;
        await setDoc(userRef, {
            displayName: randomName,
            photoURL: "",
            userId: uid,
        });
        console.log(`New user created: ${randomName}`);
    }
}

export async function saveNewGoogleUser(uid: string, displayName: string | null, photoURL: string | null) {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    console.log(userSnapshot.exists(), '유저 데이터 확인')
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
