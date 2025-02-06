"use client"
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../DB/firebaseConfig";
import { useRecoilValue } from "recoil";
import { userState } from "../state/PostState";

const useUpdateChecker = (statusPath: string) => {
    const [hasUpdate, setHasUpdate] = useState(false);
    const currentUser = useRecoilValue(userState)
    useEffect(() => {
        const fetchUpdateStatus = async () => {
            try {
                const docRef = doc(db, `users/${currentUser?.uid}/${statusPath}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setHasUpdate(docSnap.data().hasUpdate || false);
                    console.log(docSnap.data()?.hasUpdate, '업데이트 확인!');
                } else {
                    console.log('업데이트 확인 실패')
                }
            } catch (error) {
                console.error("Error fetching update status:", error);
            }
        };

        const interval = setInterval(fetchUpdateStatus, 60000); // 1분 주기로 상태 확인

        fetchUpdateStatus(); // 컴포넌트 마운트 시 즉시 상태 확인

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
    }, [statusPath, currentUser]);

    const clearUpdate = async () => {
        try {
            if (currentUser) {
                const userId = currentUser.uid

                const UpdateResponse = await fetch('http://localhost:3000/api/utils/newPostUpdate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, statusPath }),
                })

                if (!UpdateResponse.ok) {
                    const errorDetails = await UpdateResponse.json();
                    if (UpdateResponse.status === 403) {
                        throw new Error(`새 포스트 업데이트 실패 : ${errorDetails.message}`);
                    }
                    throw new Error(`새 포스트 업데이트 실패 : ${errorDetails.message}`);
                }
                setHasUpdate(false);
                console.log('업데이트 완료')
            }
        } catch (error) {
            console.error("Error clearing update status:", error);
        }
    };

    return { hasUpdate, clearUpdate };
};

export const useCommentUpdateChecker = () => useUpdateChecker("status/commentUpdates");
export const usePostUpdateChecker = () => useUpdateChecker("status/postUpdates");