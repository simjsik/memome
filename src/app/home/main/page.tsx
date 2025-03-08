import { headers } from 'next/headers';
import { fetchPosts } from "@/app/utils/fetchPostData";
import MainHome from "./MainClient";
import { Timestamp } from "firebase/firestore";

export const revalidate = 600;

export const metadata = {
    title: "메모 목록",
    description: "최근 공유된 메모를 확인해보세요.",
};

// 서버 컴포넌트
export default async function MemoPage() {
    const uid = headers().get('x-user-uid');

    const initialPosts = await fetchPosts(uid as string, undefined, 10); // 초기 10개 포스트

    return (
        <>
            <MainHome nextPageParam={initialPosts.nextPage as Timestamp} />
        </>
    )
}