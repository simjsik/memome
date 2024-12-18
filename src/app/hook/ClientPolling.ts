import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../DB/firebaseConfig";

const useUpdateChecker = () => {
    const [hasUpdate, setHasUpdate] = useState(false);

    useEffect(() => {
        const fetchUpdateStatus = async () => {
            try {
                const docRef = doc(db, "status", "updates");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setHasUpdate(docSnap.data().hasUpdate || false);
                }
                console.log('업데이트 확인!')
            } catch (error) {
                console.error("Error fetching update status:", error);
            }
        };

        const interval = setInterval(fetchUpdateStatus, 60000); // 1분 주기로 상태 확인

        fetchUpdateStatus(); // 컴포넌트 마운트 시 즉시 상태 확인

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
    }, []);

    const clearUpdate = async () => {
        try {
            const docRef = doc(db, "status", "updates");
            await updateDoc(docRef, { hasUpdate: false });
            setHasUpdate(false);
        } catch (error) {
            console.error("Error clearing update status:", error);
        }
    };

    return { hasUpdate, clearUpdate };
};


export default useUpdateChecker;