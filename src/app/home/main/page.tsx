import MainHome from './MainClient';
import { fetchPosts } from '../../api/loadToFirebasePostData/fetchPostData';

export default async function Home() {
  // 포스트 불러오기

  const { nextPage: initialNextPage } = await fetchPosts(null, null, 4);

  return (
    <>
      <MainHome post={[]} initialNextPage={initialNextPage} />;
    </>
  )
}

