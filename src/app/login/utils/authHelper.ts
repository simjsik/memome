import { auth } from "@/app/DB/firebaseConfig";

export const fetchCustomToken = async (guestUid: string) => {
    const response = await fetch("/api/customToken", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
        credentials: "include",
        body: JSON.stringify({ guestUid }),
    });

    if (!response.ok) {
        const { message } = await response.json();
        throw new Error(`커스텀 토큰 발급 실패 ${response.status}: ${message}`);
    }

    return (await response.json()).customToken;
};

export const fetchGuestLogin = async (idToken: string, newUser: boolean) => {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
        credentials: "include",
        body: JSON.stringify({ idToken, newUser }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
            // 잘못된 UID 삭제
            await auth.signOut();
            localStorage.removeItem("guestUid");
        }
        throw new Error(`게스트 로그인 실패 ${response.status}: ${errorData.message}`);
    }
    
    const data = await response.json()
    const userData = data.userData;
    return userData;
};