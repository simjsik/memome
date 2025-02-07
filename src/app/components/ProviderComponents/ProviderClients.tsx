/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect } from "react";
import { PretendardBold, PretendardLight, PretendardMedium } from "@/app/styled/FontsComponets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot, useSetRecoilState } from "recoil";
import { bookMarkState, DidYouLogin, hasGuestState, loginToggleState, userData, userState } from "@/app/state/PostState";
import { useRouter } from "next/navigation";
import '../../globals.css'
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";

const queryClient = new QueryClient();

interface loginData {
    user: userData,
    hasLogin: boolean,
    hasGuest: boolean
}

function InitializeLoginComponent({ children, loginData }: { children: ReactNode, loginData: loginData }) {
    const setUserState = useSetRecoilState<userData>(userState);
    const setLoginState = useSetRecoilState<boolean>(DidYouLogin);
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setHasGuest = useSetRecoilState<boolean>(hasGuestState)
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState)

    const router = useRouter();


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

    return <>{children}</>; // 반드시 children을 렌더링
}

export default function ProviderClient({ children, loginData }: { children: ReactNode, loginData: loginData }) {
    return (
        <div className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable}`}>
            <QueryClientProvider client={queryClient}>
                <RecoilRoot> {/* RecoilRoot로 감싸기 */}
                    <InitializeLoginComponent loginData={loginData}>
                        {children}
                    </InitializeLoginComponent>
                </RecoilRoot>
            </QueryClientProvider>
        </div>
    );
}