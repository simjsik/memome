/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { useSetRecoilState } from "recoil";
import { DidYouLogin, userState } from "../state/PostState";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";
import { useEffect } from "react";

export const loginListener = () => {
    const setUser = useSetRecoilState<string | null>(userState)
    const setLogin = useSetRecoilState<boolean>(DidYouLogin)

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (token) {
            setLogin(true);
            console.log('훅 로그인')
        } else {
            setLogin(false);
            console.log('훅 로그아웃')

        }

        if (token && !auth.currentUser) {
            signInWithCustomToken(auth, token).catch(error => {
                console.error("error signing in with token", error);

                localStorage.removeItem("authToken"); // 인증 실패 시 토큰 제거
            })
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user.uid);
                setLogin(true);
            } else {
                setUser(null);
                setLogin(false);
                localStorage.removeItem('authToken'); // 로그아웃 시 토큰 제거
            }
        })

        return () => unsubscribe();
    }, [setUser, setLogin])
}

export default loginListener