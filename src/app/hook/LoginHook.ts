import { cookies } from "next/headers";
import { userData } from "../state/PostState";

export const loginListener = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/autoLogin`, {
            method: "GET",
            credentials: "include",
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
                    name: user.name,
                    email: user.email,
                    photo: user.photo,
                    uid: user.uid,
                } as userData,
                hasLogin: true as boolean,
                hasGuest: hasGuest === true || hasGuest === false
            };
        } else {
            console.log("ID 토큰 및 유저 토큰이 유효하지 않습니다.");
            return {
                user: {
                    name: null,
                    email: null,
                    photo: null,
                    uid: '',
                } as userData,
                hasLogin: false as boolean,
                hasGuest: false as boolean
            };
        }
    } catch (error) {
        console.error("자동 로그인 실패", error);
        return {
            user: {
                name: null,
                email: null,
                photo: null,
                uid: '',
            } as userData,
            hasLogin: false as boolean,
            hasGuest: false as boolean
        };
    }
};

export default loginListener