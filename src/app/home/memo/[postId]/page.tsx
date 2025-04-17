import ClientPost from './ClientPost';
import { fetchComments } from "@/app/utils/fetchPostData";
import { PostDetailWrap } from "./memoStyle";
import { Metadata } from "next";
import { adminDb } from "@/app/DB/firebaseAdminConfig";
import { Timestamp } from 'firebase/firestore';
import { cleanHtml } from '@/app/utils/CleanHtml';

export const revalidate = 600;

interface MemoPageProps {
    params: {
        postId: string;
    };
}

// 동적 메타데이터 설정
export async function generateMetadata({ params }: MemoPageProps): Promise<Metadata> {
    const { postId } = params;

    const postRef = adminDb.collection("posts").doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
        return { title: "페이지를 찾을 수 없음" };
    }

    const post = postSnap.data();

    return {
        title: `MEMOME :: ${post?.title}`,
        description: post?.content.slice(0, 150) + "...",
        openGraph: {
            title: post?.title,
            description: post?.content.slice(0, 150) + "...",
            type: "article",
            images: [{ url: post?.images?.[0] || "/default.jpg" }]
        }
    };
}

// 서버 컴포넌트
export default async function MemoPage({ params }: MemoPageProps) {

    const { postId } = params;

    // 포스트 데이터 가져오기
    const postRef = adminDb.collection('posts').doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
        return <PostDetailWrap>
            <div>
                <div className="post_title_wrap">
                    <p className="post_title">
                        페이지를 찾을 수 없습니다.
                    </p>
                </div>
            </div>
            <div className="post_content_wrap">존재하지 않거나 삭제된 게시글 입니다.</div>
        </PostDetailWrap>
    }

    const post = postSnap.data();
    const userId = post?.userId;

    // 포스트 데이터에 유저 이름 매핑하기
    const userDocRef = adminDb.collection("users").doc(userId); // DocumentReference 생성
    const userDoc = await userDocRef.get(); // 문서 데이터 가져오기

    const userData = userDoc.exists ? userDoc.data() : { displayName: "unknown", photoURL: null } // .data() 호출 필요

    // // 포스트 댓글 가져오기
    const CommentResponse = await fetchComments(userId, postId)
    const comments = CommentResponse.comments

    const formatDate = (timestamp: Timestamp) => {
        return timestamp.toDate().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\. /g, '.');
    };

    // Function
    return (
        <>
            <ClientPost comment={comments} />
            <PostDetailWrap>
                <div>
                    <span className="post_category">{post?.tag}</span>
                    <div className="post_title_wrap">
                        <p className="post_title">
                            {post?.title}
                        </p>
                        <div className="user_id">
                            <div className="user_profile"
                                style={{ backgroundImage: `url(${userData?.photoURL})` }}
                            ></div>
                            <p>
                                {userData?.displayName} · {formatDate(post?.createAt)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="post_content_wrap" dangerouslySetInnerHTML={{ __html: cleanHtml(post?.content) }}></div>
            </PostDetailWrap>
        </>
    )
}