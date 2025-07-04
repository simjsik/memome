import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { DidYouLogin, userState } from "../state/PostState";
import { usePathname, useRouter } from "next/navigation";

export const useAuthSync = () => {
    const setUser = useSetRecoilState(userState);
    const setHasLogin = useSetRecoilState(DidYouLogin);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === "/login") return;
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    const uid = user.uid
                    const idToken = await user.getIdToken();

                    // 서버로 ID 토큰 전송
                    const loginResponse = await fetch(`/api/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                        credentials: "include",
                        body: JSON.stringify({ idToken }),
                    });

                    if (!loginResponse.ok) {
                        const errorData = await loginResponse.json();
                        if (loginResponse.status === 403) {
                            throw new Error(`CSRF 토큰 확인 불가 ${loginResponse.status}: ${errorData.message}`);
                        }
                        throw new Error(`서버 요청 에러 ${loginResponse.status}: ${errorData.message}`);
                    }

                    setUser({
                        uid: uid,
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL as string
                    });
                    setHasLogin(true);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setUser({
                        name: null,
                        email: null,
                        photo: null,
                        uid: null, // uid는 빈 문자열로 초기화
                    }); // 로그아웃 상태 처리
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
                        uid: null, // uid는 빈 문자열로 초기화
                    }); // 로그아웃 상태 처리
                    setHasLogin(false);
                    await auth.signOut();
                    router.push('/login');
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            }
        });
        return () => unsubscribe();
    }, [router]);
};

export default useAuthSync