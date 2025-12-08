export const dynamic = "force-dynamic";
import ClientPost from './ClientPost';
import { PostDetailWrap } from "./memoStyle";
import { Metadata } from "next";
import { adminDb } from "@/app/DB/firebaseAdminConfig";
import { SSRcleanHtml } from '@/app/utils/CleanHtml';
import { formatDate } from '@/app/utils/formatDate';

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
        return {
            title: `MEMOME :: 페이지를 찾을 수 없습니다.`,
            description: "...",
            openGraph: {
                title: `MEMOME :: 페이지를 찾을 수 없습니다.`,
                description: "...",
                type: "article",
                url: `https://memome-delta.vercel.app/home/main`,
                images: [{ url: "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1749549274/%EB%AD%94%EA%B0%80%EC%97%86%EC%9D%84%EB%95%8C_bvky0y.svg" }]
            },
            twitter: {
                card: 'summary_large_image',
                title: `MEMOME :: 페이지를 찾을 수 없습니다.`,
                description: "...",
                images: [{ url: "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1749549274/%EB%AD%94%EA%B0%80%EC%97%86%EC%9D%84%EB%95%8C_bvky0y.svg" }]
            },
        };
    }

    const post = postSnap.data();

    const plainText = post?.content.replace(/<[^>]*>/g, '');
    const description = plainText.slice(0, 150) + '...';

    return {
        title: `MEMOME :: ${post?.title}`,
        description: description,
        openGraph: {
            title: `MEMOME :: ${post?.title}`,
            description: description,
            type: "article",
            url: `https://memome-delta.vercel.app/home/memo/${params.postId}`,
            images: [{ url: post?.images?.[0] || "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1749549274/%EB%AD%94%EA%B0%80%EC%97%86%EC%9D%84%EB%95%8C_bvky0y.svg" }]
        },
        twitter: {
            card: 'summary_large_image',
            title: `MEMOME :: ${post?.title}`,
            description: description,
            images: [{ url: post?.images?.[0] || "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1749549274/%EB%AD%94%EA%B0%80%EC%97%86%EC%9D%84%EB%95%8C_bvky0y.svg" }]
        },
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
    const commentLength = post?.commentCount as number;
    const postCreateAt = post?.createAt.toMillis();
    // 포스트 데이터에 유저 이름 매핑하기
    const userDocRef = adminDb.collection("users").doc(userId); // DocumentReference 생성
    const userDoc = await userDocRef.get(); // 문서 데이터 가져오기

    const userData = userDoc.exists ? userDoc.data() : { displayName: "Unknown User", photoURL: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg' }

    // Function
    return (
        <>
            <ClientPost commentLength={commentLength} />
            <PostDetailWrap>
                <div>
                    {post?.notice ? <><span className="post_category notice">{post?.tag}</span></> : <><span className="post_category">[{post?.tag}]</span></>}
                    <div className="post_title_wrap">
                        <p className="post_title">
                            {post?.title}
                        </p>
                        <div className="user_id">
                            <div className="user_profile"
                                style={{ backgroundImage: `url(${userData?.photoURL})` }}
                            ></div>
                            <p>
                                {userData?.displayName} ·&nbsp;
                            </p>
                            <time>{formatDate(postCreateAt)}</time>
                        </div>
                    </div>
                </div>
                <div className="post_content_wrap ql-editor" dangerouslySetInnerHTML={{ __html: SSRcleanHtml(post?.content) }}></div>
            </PostDetailWrap>
        </>
    )
}