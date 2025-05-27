/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect } from "react";
import { PretendardBold, PretendardLight, PretendardMedium } from "@/app/styled/FontsComponets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import "./globals.css";
import useAuthSync from "./hook/AuthSyncHook";
import { adminState, bookMarkState, hasGuestState, userState } from "./state/PostState";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./DB/firebaseConfig";
import { usePostUpdateChecker } from "./hook/ClientPolling";
import { usePathname } from "next/navigation";
import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const queryClient = new QueryClient();

interface CustomClaims {
    roles?: {
        admin?: boolean;
        guest?: boolean;
    };
}

function InitializeLoginComponent({ children }: { children: ReactNode }) {
    const { clearUpdate } = usePostUpdateChecker();

    const currentUser = useRecoilValue(userState);
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState);
    const setAdmin = useSetRecoilState<boolean>(adminState);
    const setGuest = useSetRecoilState<boolean>(hasGuestState);
    const pathName = usePathname();

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

    useAuthSync();

    useEffect(() => {
        loadBookmarks(currentUser.uid as string);
    }, [currentUser])

    useEffect(() => {
        clearUpdate();
    }, [currentUser, pathName])

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async user => {
            if (!user) {
                setAdmin(false);
                return;
            }

            const idTokenResult = await getIdTokenResult(user);
            const claims = idTokenResult.claims as CustomClaims;
            setAdmin(!!claims.roles?.admin); // !!로 boolean 타입 강제 변환
            setGuest(!!claims.roles?.guest); // !!로 boolean 타입 강제 변환
        });

        return unsub;
    }, []);

    return <>{children}</>; // 반드시 children을 렌더링
}

export default function ProviderClient({ children, nonce }: { children: ReactNode, nonce: string }) {
    const cache = createCache({ key: 'custom', nonce });
    console.log(nonce, '클라이언트 측 난수값')
    return (
        <div className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable} main_wrap`}>
            <QueryClientProvider client={queryClient}>
                <RecoilRoot>
                    <CacheProvider value={cache}>
                        <InitializeLoginComponent>
                            <>
                                {children}
                            </>
                        </InitializeLoginComponent>
                    </CacheProvider>
                </RecoilRoot>
            </QueryClientProvider>
        </div>
    );
}