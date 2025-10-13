'use client';

import { useSetRecoilState } from "recoil";
import { DidYouLogin, loadingState, userState } from "../state/PostState";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { useCallback, useRef } from "react";

export const useAuthSync = () => {
    const isRefreshingRef = useRef(false);
    const setUser = useSetRecoilState(userState);
    const setHasLogin = useSetRecoilState(DidYouLogin);
    const setLoading = useSetRecoilState<boolean>(loadingState);
    const auth = getAuth();
    const router = useRouter();

    const authSync = useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        setLoading(true);

        try {
            const refresh = document.cookie.split('; ').find(c => c?.startsWith('refreshCsrfToken='))?.split('=')[1];
            const refreshfValue = refresh ? decodeURIComponent(refresh) : '';

            const user = auth.currentUser
            if (user) {
                const idToken = await user?.getIdToken();
                const response = await fetch(`/api/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin, 'x-refresh-csrf': refreshfValue },
                    credentials: 'include',
                    body: JSON.stringify(idToken)
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('동기화 실패 :', errorData.message)
                    throw new Error(errorData.message)
                };

                setUser({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL || 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
                    uid: user.uid,
                });

                setHasLogin(true);
                router.replace('/home/main');
            }
            return;
        } catch (error: unknown) {
            if (error instanceof Error) {
                setUser({
                    name: null,
                    email: null,
                    photo: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
                    uid: null,
                }); // 로그아웃 상태 처리

                const response = await fetch(`/api/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('로그아웃 실패 :', errorData.message)
                };
                setHasLogin(false);
                await auth.signOut();
                router.push('/login');
                throw error;
            } else {
                console.error("알 수 없는 에러 유형:", error);
                setUser({
                    name: null,
                    email: null,
                    photo: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
                    uid: null,
                }); // 로그아웃 상태 처리
                setHasLogin(false);
                const response = await fetch(`/api/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('로그아웃 실패 :', errorData.message)
                };
                await auth.signOut();
                router.push('/login');
                throw new Error("알 수 없는 에러가 발생했습니다.");
            }
        } finally {
            isRefreshingRef.current = false;
            setLoading(false);
        }
    }, []);

    return authSync;
};
export default useAuthSync