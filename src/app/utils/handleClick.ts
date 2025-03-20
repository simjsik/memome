"use client";

import { useRouter } from "next/navigation";
export const useHandleUsernameClick = () => {
    const router = useRouter();

    const handleUsernameClick = (userId: string) => {

        router.push(`/home/user/${userId}`);
    }

    return handleUsernameClick;
}