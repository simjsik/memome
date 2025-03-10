import ClientPost from './ClientPost';
import { fetchComments } from "@/app/utils/fetchPostData";
import { PostDetailWrap } from "./memoStyle";
import { adminDb } from "@/app/DB/firebaseAdminConfig";

export const dynamic = "force-dynamic"; // 동적 렌더링 설정
export const revalidate = 600;

interface MemoPageProps {
    params: {
        postId: string;
    };
}


// 서버 컴포넌트
export default async function MemoPage({ params }: MemoPageProps) {

    const { postId } = params;

    // 포스트 데이터 가져오기
    const postRef = adminDb.collection('posts').doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
        return { title: "페이지를 찾을 수 없음" };
    }

    const post = postSnap.data();
    const userId = post?.userId;



    // // 포스트 댓글 가져오기
    const CommentResponse = await fetchComments(userId, postId)
    const comments = CommentResponse.comments


    // Function
    return (
        <>
            <ClientPost comment={comments} />
            <PostDetailWrap>
                <div>
                    <div className="user_id">
                        <div className="user_profile"
                        ></div>
                        <p>
                        </p>
                    </div>
                </div>
            </PostDetailWrap >
        </>
    )
}