/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"

import { ReactNode } from "react";
import { PretendardBold, PretendardLight, PretendardMedium } from "@/app/styled/FontsComponets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";

const queryClient = new QueryClient();

type LayoutProps = {
    children: ReactNode;
};
export default function ProviderClient({ children }: LayoutProps) {

    return (
        <div className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable}`}>
            <QueryClientProvider client={queryClient}>
                <RecoilRoot> {/* RecoilRoot로 감싸기 */}
                    {children}
                </RecoilRoot>
            </QueryClientProvider>
        </div>
    );
}