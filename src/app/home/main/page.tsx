import MainHome from './MainClient';
import { cookies } from 'next/headers';
import { authenticateUser } from '@/app/utils/redisClient';
import { fetchPosts } from '@/app/utils/fetchPostData';

const JWT_SECRET = process.env.JWT_SECRET; // JWT 비밀키

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

  const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
    method: "POST",
    headers: {
      Cookie: cookies().toString(),
    },
    body: JSON.stringify({ uid }),
  });

  if (!validateResponse.ok) {
    const errorDetails = await validateResponse.json();
    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
  }

  const { data, nextPage } = await fetchPosts(uid, null, 4);

  return (
    <>
      <MainHome post={data} initialNextPage={nextPage} />;
    </>
  )
}

