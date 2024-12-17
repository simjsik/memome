import { getFirestore, collection, getDocs, updateDoc } from "firebase/firestore";

const db = getFirestore();

async function triggerDataSync() {
    const collectionRef = collection(db, "posts"); // 동기화 대상 Collection
    const snapshot = await getDocs(collectionRef);

    snapshot.forEach(async (doc) => {
        // 데이터를 수정하지 않더라도 update 이벤트 발생
        await updateDoc(doc.ref, { forceSync: true }); // 필드 추가 또는 아무 필드라도 수정
    });
}

