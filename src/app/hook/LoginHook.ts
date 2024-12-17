/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { useSetRecoilState } from "recoil";
import { DidYouLogin, userState } from "../state/PostState";
import { useEffect } from "react";

export const loginListener = () => {
    const setUser = useSetRecoilState<string | null>(userState)
    const setLogin = useSetRecoilState<boolean>(DidYouLogin)

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("/api/utils/validateAuthToken", {
                    method: "GET",
                    credentials: "include", // 쿠키를 요청에 포함
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setLogin(true);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch session:", error);
                setUser(null);
            }
        };

        checkLoginStatus();
    }, [setUser]);

}

export default loginListener