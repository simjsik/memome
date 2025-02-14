import { authenticateUser } from '@/app/utils/redisClient';
import ClientNotice from './ClientNotice';
import { cookies } from 'next/headers';
import { fetchNoticePosts } from '@/app/utils/fetchPostData';

const JWT_SECRET = process.env.JWT_SECRET; // JWT 비밀키

export const revalidate = 60; // 60초마다 페이지를 재생성(ISR)

export default async function Home() {
    // 포스트 불러오기
    const cookieStore = cookies();

    const userToken = cookieStore.get('userToken')?.value;

    if (!userToken || userToken === 'undefined') {
        return console.error("유저 토큰이 누락되었습니다.");
    }

    if (!JWT_SECRET) {
        return console.error("유저 토큰 접근 권한이 없습니다.");
    }

    if (!authenticateUser(userToken)) {
        return console.error("유저 토큰이 유효하지 않습니다.");
    }

    const uid = await authenticateUser(userToken) as string

    if (!uid) {
        return console.error("유저 토큰이 유효하지 않습니다.");
    }

    const { data, nextPage: initialNextPage } = await fetchNoticePosts(uid, [true, null], 5);

    return (
        <>
            <ClientNotice post={data} initialNextPage={initialNextPage} />;
        </>
    )
}
