/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect, useState } from "react";
import { PretendardBold, PretendardLight, PretendardMedium } from "@/app/styled/FontsComponets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import "./globals.css";
import { adminState, bookMarkState, DidYouLogin, hasGuestState, loadingState, userState } from "./state/PostState";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./DB/firebaseConfig";
import { usePostUpdateChecker } from "./hook/ClientPolling";
import { useRouter } from "next/navigation";
import { CacheProvider, ThemeProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { getAuth, getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import GlobalLoadingWrap from "./components/GlobalLoading";
import { darkTheme, lightTheme } from "./styled/theme";
import GlobalStyles from "./styled/GlobalStyles";

const queryClient = new QueryClient();

interface CustomClaims {
    roles?: {
        admin?: boolean;
        guest?: boolean;
    };
}

function InitializeLoginComponent({ children }: { children: ReactNode }) {
    const { clearUpdate } = usePostUpdateChecker();
    const setUser = useSetRecoilState(userState);
    const setHasLogin = useSetRecoilState(DidYouLogin);
    const setAdmin = useSetRecoilState<boolean>(adminState);
    const setGuest = useSetRecoilState<boolean>(hasGuestState);
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState);
    const currentUser = useRecoilValue(userState);

    const [loading, setLoading] = useRecoilState<boolean>(loadingState);
    const router = useRouter();

    const loadBookmarks = async (uid: string) => {
        try {
            const bookmarks = await getDoc(doc(db, `users/${uid}/bookmarks/bookmarkId`));
            if (bookmarks.exists()) {
                // 북마크 데이터가 있을 경우
                const data = bookmarks.data() as { bookmarkId: string[] };
                setCurrentBookmark(data.bookmarkId); // Recoil 상태 업데이트
            }
        } catch (error) {
            console.error("북마크 데이터를 가져오는 중 오류 발생:", error);
            setCurrentBookmark([]);
        }
    }

    useEffect(() => {
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

                    const idTokenResult = await getIdTokenResult(user);
                    const claims = idTokenResult.claims as CustomClaims;
                    setAdmin(!!claims.roles?.admin); // !!로 boolean 타입 강제 변환
                    console.log(!!claims.roles?.admin, '어드민')
                    setGuest(!!claims.roles?.guest);
                    await setUser({
                        uid: uid,
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL as string
                    });
                    setHasLogin(true);
                } else {
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
                        uid: null,
                    });
                    setHasLogin(false);
                    await auth.signOut();
                    router.push('/login');
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        loadBookmarks(currentUser.uid as string);
    }, [currentUser])

    useEffect(() => {
        clearUpdate();
    }, [currentUser, router])

    if (loading) {
        return <GlobalLoadingWrap />;
    }


    return <>{children}</>;
}

export default function ProviderClient({ children, nonce }: { children: ReactNode, nonce: string }) {
    const cache = createCache({ key: 'custom', nonce });
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');

        setIsDark(media.matches);

        const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);

        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, []);

    return (
        <div className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable} main_wrap`}>
            <QueryClientProvider client={queryClient}>
                <RecoilRoot>
                    <CacheProvider value={cache}>
                        <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
                            <GlobalStyles />
                            <InitializeLoginComponent>
                                <>
                                    {children}
                                </>
                            </InitializeLoginComponent>
                        </ThemeProvider>
                    </CacheProvider>
                </RecoilRoot>
            </QueryClientProvider>
        </div>
    );
}