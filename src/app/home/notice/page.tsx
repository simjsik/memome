import { fetchPosts } from '../../api/loadToFirebasePostData/fetchPostData';
import ClientNotice from './ClientNotice';

export default async function Home() {
    // 포스트 불러오기
    const { nextPage: initialNextPage } = await fetchPosts(null, [true, null], 4);

    return (
        <>
            <ClientNotice post={[]} initialNextPage={initialNextPage} />;
        </>
    )
}
