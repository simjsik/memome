/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { useSetRecoilState } from "recoil";
import { DidYouLogin, userData, userState } from "../state/PostState";
import { useEffect } from "react";

export const loginListener = () => {
    const setUser = useSetRecoilState<userData | null>(userState)
    const setLogin = useSetRecoilState<boolean>(DidYouLogin)

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("/api/utils/autoLoginToken", {
                    method: "GET",
                    credentials: "include", // 쿠키를 요청에 포함
                });

                const data = await response.json();

                if (response.ok) {
                    const { user } = data;

                    setUser({
                        name: user.displayName,
                        email: user.email,
                        photo: user.photoURL,
                        uid: user.uid,
                    });

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
    }, []);
}

export default loginListener