"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSetRecoilState } from "recoil";
import { loadingState } from "../state/PostState";

export default function RouteChangeListener() {
    const router = useRouter();
    const setLoading = useSetRecoilState(loadingState);
    const pathName = usePathname();
    useEffect(() => {
        console.log('페이지 이동')

        // 페이지 이탈 시 스크롤 위치 저장
        const handleLoading = () => {
            setLoading(true)
        };

        window.addEventListener('popstate', handleLoading);

        // 클린업
        return () => {
            window.removeEventListener('popstate', handleLoading);
        };
    }, [router, pathName]);

    return null;
}
