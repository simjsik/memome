import { deleteCookie } from "cookies-next";

export async function logout() {
    try {
        // 클라이언트 측 쿠키 삭제
        deleteCookie("authToken");
        return { success: true };
    } catch (error) {
        console.error("Error logging out:", error);
        return { success: false, message: error };
    }
}
