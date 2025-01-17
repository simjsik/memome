/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect } from "react";
import { PretendardBold, PretendardLight, PretendardMedium } from "@/app/styled/FontsComponets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, userData, userState } from "@/app/state/PostState";
import { useRouter } from "next/navigation";

const queryClient = new QueryClient();

interface DefaultMainProps {
    user: userData | null,
    hasLogin: boolean
}


function InitializeLoginComponent({ children, user, hasLogin }: { children: ReactNode, user: DefaultMainProps, hasLogin: DefaultMainProps }) {
    const setUserState = useSetRecoilState<userData | null>(userState);
    const setLoginState = useSetRecoilState<boolean>(DidYouLogin);
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)

    const router = useRouter();
    useEffect(() => {
        console.log(user, hasLogin)
        if (!hasLogin) {
            setLoginToggle(true);
            router.push('/login');
            return;
        }

        setUserState(user.user);
        setLoginState(true);
        router.push('/home/main');
    }, [user, hasLogin])
    return <>{children}</>; // 반드시 children을 렌더링
}

export default function ProviderClient({ children, loginData }: { children: ReactNode, loginData: any }) {
    return (
        <div className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable}`}>
            <QueryClientProvider client={queryClient}>
                <RecoilRoot> {/* RecoilRoot로 감싸기 */}
                    <InitializeLoginComponent user={loginData.user} hasLogin={loginData.hasLogin}>
                        {children}
                    </InitializeLoginComponent>
                </RecoilRoot>
            </QueryClientProvider>
        </div>
    );
}