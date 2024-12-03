import { db } from "@/app/DB/firebaseConfig";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import ClientPost from './ClientPost';

interface MemoPageProps {
    params: {
        postId: string;
    };
}

// 서버 컴포넌트
export default async function MemoPage({ params }: MemoPageProps) {
    // state
    const { postId } = params;
    // 포스트 데이터 가져오기
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
        throw new Error('해당 포스터를 찾을 수 없습니다.');
    }

    const post = postSnap.data();
    const transformedPost = {
        ...post,
        postId: postId,
        createAt: new Date(post.createAt.seconds * 1000).toISOString(), // ISO 형식 문자열
    }
    
    const postAddCommnet = {
        ...transformedPost,
    }

    // Function
    return (
        <>
            <ClientPost post={postAddCommnet} />
        </>
    )
}