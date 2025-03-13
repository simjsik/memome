/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect } from "react";
import { PretendardBold, PretendardLight, PretendardMedium } from "@/app/styled/FontsComponets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot, useRecoilState, useSetRecoilState } from "recoil";
import { bookMarkState, DidYouLogin, hasGuestState, loginToggleState, userData, userState } from "@/app/state/PostState";
import { useRouter } from "next/navigation";
import "./globals.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./DB/firebaseConfig";

const queryClient = new QueryClient();

interface loginData {
    user: userData,
    hasLogin: boolean,
    hasGuest: boolean
}

function InitializeLoginComponent({ children, loginData }: { children: ReactNode, loginData: loginData }) {
    const [currentUser, setUserState] = useRecoilState<userData>(userState);
    const setLoginState = useSetRecoilState<boolean>(DidYouLogin);
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setHasGuest = useSetRecoilState<boolean>(hasGuestState)
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState)

    const router = useRouter();

    const loadBookmarks = async (uid: string) => {
        console.log('북마크 데이터 요청 함수 실행', typeof loginData.hasGuest, loginData.hasGuest)
        if (loginData.hasGuest) {
            console.log('게스트 북마크 데이터 요청 취소')
            return setCurrentBookmark([]);
        }

        try {
            console.log('북마크 데이터 요청')
            const bookmarks = await getDoc(doc(db, `users/${uid}/bookmarks/bookmarkId`));
            console.log(bookmarks.exists(), '북마크 유무');
            if (bookmarks.exists()) {
                // 북마크 데이터가 있을 경우
                const data = bookmarks.data() as { bookmarkId: string[] };
                setCurrentBookmark(data.bookmarkId); // Recoil 상태 업데이트
                console.log(data.bookmarkId, '북마크 리스트 목록');
            }
        } catch (error) {
            console.error("북마크 데이터를 가져오는 중 오류 발생:", error);
            setCurrentBookmark([]);
        }
    }

    useEffect(() => {
        if (!loginData.hasLogin) {
            setLoginToggle(true);
            router.push('/login');
            return;
        }

        // 상태 업데이트
        setUserState(loginData.user);
        setLoginState(true);
        setHasGuest(loginData.hasGuest);
        router.push('/home/main');
    }, [loginData])

    useEffect(() => {
        console.log(loginData.user, '로그인 유저 정보')
        if (currentUser.uid) {
            console.log(currentUser.uid, '북마크 요청 유저 UID')
            loadBookmarks(currentUser.uid);
        }

    }, [currentUser, loginData, loginData.user])

    return <>{children}</>; // 반드시 children을 렌더링
}

export default function ProviderClient({ children, loginData }: { children: ReactNode, loginData: loginData }) {
    return (
        <div className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable}`}>
            <QueryClientProvider client={queryClient}>
                <RecoilRoot> {/* RecoilRoot로 감싸기 */}
                    <InitializeLoginComponent loginData={loginData}>
                        <>
                            {children}
                        </>
                    </InitializeLoginComponent>
                </RecoilRoot>
            </QueryClientProvider>
        </div>
    );
}