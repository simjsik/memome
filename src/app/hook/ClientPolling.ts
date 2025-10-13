"use client"
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../DB/firebaseConfig";
import { useRecoilValue } from "recoil";
import { hasGuestState, userState } from "../state/PostState";

const useUpdateChecker = () => {
    const [hasUpdate, setHasUpdate] = useState(false);
    const currentUser = useRecoilValue(userState)
    const hasGuest = useRecoilValue(hasGuestState)

    useEffect(() => {
        let polling = false;
        const fetchUpdateStatus = async () => {
            try {
                if (polling) return;

                if (!currentUser.uid) return setHasUpdate(false);
                console.log('폴링중')

                polling = true;

                const feedRef = doc(db, 'postFeed', 'main');
                const feedSnap = await getDoc(feedRef);
                if (!feedSnap.exists()) {
                    return setHasUpdate(false);
                }

                const feed = feedSnap.data();
                if (!feed) {
                    return setHasUpdate(false);
                }

                const userRef = hasGuest ?
                    doc(db, 'guests', currentUser.uid, 'status', 'postUpdates')
                    :
                    doc(db, 'users', currentUser.uid, 'status', 'postUpdates');

                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    return setHasUpdate(true);
                }
                
                const userTime = userSnap.data();
                if (!userTime) {
                    return setHasUpdate(true);
                }

                if (!feed.updatedAt || !userTime.lastSeenAt) {
                    return setHasUpdate(true);
                }

                const updatedAt = feed?.updatedAt.toMillis();
                const lastSeenAt = userTime?.lastSeenAt.toMillis();

                if (updatedAt <= lastSeenAt) {
                    return setHasUpdate(false);
                }

                if (updatedAt > lastSeenAt) {
                    return setHasUpdate(true);
                }

            } catch (error) {
                console.error("Error fetching update status:", error);
            } finally {
                polling = false;
            }
        };

        const interval = setInterval(fetchUpdateStatus, 60000); // 1분 주기로 상태 확인

        fetchUpdateStatus(); // 컴포넌트 마운트 시 즉시 상태 확인

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
    }, [currentUser.uid, hasGuest]);

    return { hasUpdate, setHasUpdate };
};

export const usePostUpdateChecker = () => useUpdateChecker();