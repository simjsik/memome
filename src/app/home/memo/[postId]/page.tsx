/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { db } from "@/app/DB/firebaseConfig";
import { doc, getDoc, } from "firebase/firestore";
import ClientPost from './ClientPost';
import { fetchComments } from "@/app/utils/fetchPostData";

interface MemoPageProps {
    params: {
        postId: string;
    };
}

export const revalidate = 60;

// 서버 컴포넌트
export default async function MemoPage({ params }: MemoPageProps) {

    const userCache = new Map<string, { nickname: string; photo: string | null }>();
    const { postId } = params;

    // 포스트 데이터 가져오기
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
        throw new Error('해당 포스터를 찾을 수 없습니다.');
    }

    const post = postSnap.data();
    const userId = post.userId;

    // 포스트 데이터에 유저 이름 매핑하기
    if (!userCache.has(userId)) {
        const userDocRef = doc(db, "users", userId); // DocumentReference 생성
        const userDoc = await getDoc(userDocRef); // 문서 데이터 가져오기

        if (userDoc.exists()) {
            const userData = userDoc.data() as { displayName: string; photoURL: string | null }; // .data() 호출 필요
            userCache.set(userId, {
                nickname: userData.displayName,
                photo: userData.photoURL || null,
            });

        } else {
            userCache.set(userId, {
                nickname: "Unknown",
                photo: null,
            });
        }
    }

    const userData = userCache.get(postSnap.data().userId) || { nickname: 'Unknown', photo: null }

    const transformedPost = {
        ...post,
        postId: postId,
        createAt: new Date(post.createAt.seconds * 1000).toISOString(), // ISO 형식 문자열
        displayName: userData.nickname,
        photoURL: userData.photo,
    }

    // // 포스트 댓글 가져오기
    const CommentResponse = await fetchComments(userId, postId)
    const comments = CommentResponse.comments

    const postAddComment = {
        ...transformedPost,
    }

    // Function
    return (
        <>
            <ClientPost post={postAddComment} comment={comments} />
        </>
    )
}