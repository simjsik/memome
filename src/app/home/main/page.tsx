
import MainHome from './MainClient';
import { fetchPosts } from '../../api/loadToFirebasePostData/fetchPostData';
import NavWrap from '@/app/components/NavWrap';

export default async function Home() {


  // 포스트 불러오기

  const { nextPage: initialNextPage } = await fetchPosts(null, 4, 0);

  return (
    <>
      <MainHome posts={[]} initialNextPage={initialNextPage} />;
    </>
  )
}

