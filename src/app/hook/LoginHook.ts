import { cookies } from "next/headers";
import { userData } from "../state/PostState";

export const loginListener = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utils/autoLoginToken`, {
            method: "GET",
            headers: {
                Cookie: cookies().toString(),
            },
        });

        if (response.ok) {
            // 비동기 데이터 처리 시 Promise로 남겨질 걸 생각해 await 사용.
            const data = await response.json();
            const { user, hasGuest } = data;
            return {
                user: {
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    uid: user.uid,
                } as userData,
                hasLogin: true,
                hasGuest: hasGuest
            };
        } else {
            console.log("No auth token or invalid token");
            return { user: null, hasLogin: false };
        }
    } catch (error) {
        console.error("Failed to fetch session:", error);
        return { user: null, hasLogin: false };
    }
};

export default loginListener