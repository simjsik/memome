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
import { getAuth, getIdTokenResult, onAuthStateChanged, updateProfile } from "firebase/auth";
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
    const setCurrentBookmark = useSetRecoilState<string[] | null>(bookMarkState);
    const currentUser = useRecoilValue(userState);
    const [loading, setLoading] = useRecoilState<boolean>(loadingState);
    const router = useRouter();

    const loadBookmarks = async (uid: string) => {
        console.log(uid, '북마크 요청 UID')
        try {
            const bookmarks = await getDoc(doc(db, `users/${uid}/bookmarks/bookmarkId`));
            if (bookmarks.exists()) {
                // 북마크 데이터가 있을 경우
                const data = bookmarks.data() as { bookmarkId: string[] };
                console.log(data.bookmarkId, '현재 유저 북마크')

                setCurrentBookmark(data.bookmarkId); // Recoil 상태 업데이트
            }
        } catch (error) {
            console.error("북마크 데이터를 가져오는 중 오류 발생:", error);
            setCurrentBookmark(null);
        }
    }

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    const uid = user.uid;
                    const idTokenResult = await getIdTokenResult(user);
                    const claims = idTokenResult.claims as CustomClaims;

                    const userDoc = claims.roles?.guest ? await getDoc(doc(db, "users", uid)) : await getDoc(doc(db, "guests", uid));
                    if (!userDoc.exists()) {
                        console.error("유저 정보를 찾을 수 없습니다.", uid, claims.roles?.guest);
                        throw new Error("유저 문서 없음");
                    };

                    if (!user.displayName?.trim()) {
                        const docData = userDoc.data() as { displayName?: string; photoURL?: string };
                        await updateProfile(user, {
                            displayName: docData.displayName,
                            photoURL: docData.photoURL,
                        });
                    };

                    loadBookmarks(uid as string);
                    setAdmin(!!claims.roles?.admin); // !!로 boolean 타입 강제 변환
                    setGuest(!!claims.roles?.guest);
                    setUser({
                        uid: uid,
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL as string
                    });
                    setHasLogin(true);
                };
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
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        clearUpdate();
    }, [currentUser, router]);

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