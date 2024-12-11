
import MainHome from './MainClient';
import { fetchPosts } from '../../api/loadToFirebasePostData/fetchPostData';

export default async function Home() {


  // 포스트 불러오기

  const { data: commentSnapshot, nextPage: initialNextPage } = await fetchPosts(null, 4, 0);

  return <MainHome posts={commentSnapshot} initialNextPage={initialNextPage} />;
}

