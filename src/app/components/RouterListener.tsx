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
        console.log('페이지 이동( 로딩 UI )')
        setLoading(true)
    }, [router, pathName]);

    return null;
}
