export const dynamic = "force-dynamic";
import ClientPost from './ClientPost';
import { PostDetailWrap } from "./memoStyle";
import { Metadata } from "next";
import { adminDb } from "@/app/DB/firebaseAdminConfig";
import { SSRcleanHtml } from '@/app/utils/CleanHtml';
import { Timestamp } from 'firebase-admin/firestore';
interface MemoPageProps {
    params: {
        postId: string;
    };
}

const formatDate = (createAt: Timestamp | Date | string | number): string => {
    const date: Date =
        createAt instanceof Timestamp
            ? createAt.toDate()
            : new Date(createAt);

    const now = new Date();
    const befMs = now.getTime() - date.getTime();

    const befHour = befMs / (1000 * 60 * 60);

    const befDay = befMs / (1000 * 60 * 24);

    if (befHour < 24) {
        // 0시간 방지
        const hours = Math.max(Math.round(befHour), 1);
        return `${hours}시간 전`;
    }

    if (befDay < 7) {
        const days = Math.max(Math.round(befDay), 1);
        return `${days}일 전`;
    }

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
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

    // 포스트 데이터에 유저 이름 매핑하기
    const userDocRef = adminDb.collection("users").doc(userId); // DocumentReference 생성
    const userDoc = await userDocRef.get(); // 문서 데이터 가져오기

    const userData = userDoc.exists ? userDoc.data() : { displayName: "unknown", photoURL: null } // .data() 호출 필요

    // Function
    return (
        <>
            <ClientPost commentLength={commentLength} />
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
                                {userData?.displayName} ·
                            </p>
                            <span>{formatDate(post?.createAt)}</span>
                        </div>
                    </div>
                </div>
                <div className="post_content_wrap ql-editor" dangerouslySetInnerHTML={{ __html: SSRcleanHtml(post?.content) }}></div>
            </PostDetailWrap>
        </>
    )
}