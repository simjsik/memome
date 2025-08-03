/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect, useRef, useState } from "react";
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
import { getAuth, getIdTokenResult, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
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
    const initializing = useRef(true);
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
        let handleRedirect = false;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (initializing.current) {
                initializing.current = false;

                if (user) {
                    const uid = user.uid

                    let userDoc = await getDoc(doc(db, "users", uid));
                    if (!userDoc.exists()) {
                        userDoc = await getDoc(doc(db, "guests", uid));
                        if (!userDoc.exists()) {
                            console.error("유저 정보를 찾을 수 없습니다.");
                            handleRedirect = true;
                        };
                    };

                    if (handleRedirect) {
                        const response = await fetch(`/api/logout`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                            credentials: 'include',
                        });

                        if (!response.ok) {
                            const errorData = await response.json()
                            console.error('로그아웃 실패 :', errorData.message)
                        };

                        await signOut(auth);

                        setUser({
                            uid: null,
                            email: null,
                            name: null,
                            photo: null
                        });
                        setHasLogin(false);
                        setLoading(false);
                        router.replace("/login");
                        return;
                    };

                    // Firebase Authentication의 프로필 업데이트
                    if (!user.displayName?.trim()) {
                        const docData = userDoc.data() as { displayName?: string; photoURL?: string };
                        await updateProfile(user, {
                            displayName: docData.displayName,
                            photoURL: docData.photoURL,
                        });
                    }

                    await setUser({
                        uid: uid,
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL as string
                    });
                    setHasLogin(true);
                    setLoading(false);

                    const idTokenResult = await getIdTokenResult(user);
                    const claims = idTokenResult.claims as CustomClaims;
                    setAdmin(!!claims.roles?.admin); // !!로 boolean 타입 강제 변환
                    setGuest(!!claims.roles?.guest);

                    setLoading(false);
                };
            };

            if (!user) {
                const response = await fetch(`/api/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('로그아웃 실패 :', errorData.message)
                };

                await signOut(auth);

                setUser({
                    uid: null,
                    email: null,
                    name: null,
                    photo: null
                });
                setHasLogin(false);
                setLoading(false);
                router.replace("/login");

                return;
            };
        });

        return () => unsubscribe();
    }, [router, initializing]);

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