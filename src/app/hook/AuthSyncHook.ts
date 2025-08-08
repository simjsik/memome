'use client';

import { useSetRecoilState } from "recoil";
import { DidYouLogin, loadingState, userState } from "../state/PostState";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { useCallback } from "react";

export const useAuthSync = () => {
    const setUser = useSetRecoilState(userState);
    const setHasLogin = useSetRecoilState(DidYouLogin);
    const setLoading = useSetRecoilState<boolean>(loadingState);
    const auth = getAuth();
    const router = useRouter();

    const authSync = useCallback(async () => {
        setLoading(true);

        try {
            const user = auth.currentUser
            if (user) {
                const uid = user.uid
                const idToken = await user.getIdToken();
                const loginResponse = await fetch(`/api/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: "include",
                    body: JSON.stringify({ idToken }),
                });

                if (!loginResponse.ok) {
                    const errorData = await loginResponse.json();
                    throw new Error(`로그인 시도 실패 ${loginResponse.status}: ${errorData.message}`);
                }

                setUser({
                    uid: uid,
                    email: user.email,
                    name: user.displayName,
                    photo: user.photoURL as string
                });

                setHasLogin(true);

                router.replace('/home/main');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setUser({
                    name: null,
                    email: null,
                    photo: null,
                    uid: null, // uid는 빈 문자열로 초기화
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
                    photo: null,
                    uid: null,
                });
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
            setLoading(false);
        }
    }, []);

    return authSync;
};
export default useAuthSync