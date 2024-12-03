import { signOut } from "firebase/auth";
import { auth } from "../DB/firebaseConfig"

export const logoutClearToken = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('authToken'); // 로그아웃 시 토큰 제거
        alert('로그아웃에 성공하였습니다.')
    } catch (error) {
        alert('로그아웃에 실패하였습니다.' + error);
    }
}