// src/api/loginApi.ts

import { auth } from '../DB/firebaseConfig'; // firebaseConfig.ts에서 auth와 db 가져오기
import { signInAnonymously, signInWithEmailAndPassword } from "firebase/auth";

// 익명 로그인
export const anonymousLogin = async () => {
    try {
        await signInAnonymously(auth);
        console.log("Anonymous login successful");
    } catch (error) {
        console.error("Anonymous login error:", error);
    }
}

// 이메일 로그인 후 토큰을 가져오는 함수
export const loginAndFetchToken = async (email: string, password: string): Promise<string | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken(); // 최신 토큰 가져오기

        return token;
    } catch (error) {
        console.error("Error fetching token:", error);
        return null;
    }
};
