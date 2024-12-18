import { db } from "@/app/DB/firebaseConfig";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import ClientPost from './ClientPost';
import StatusBox from "@/app/components/StatusBox";
import { Comment } from "@/app/state/PostState";

interface MemoPageProps {
    params: {
        postId: string;
    };
}

// 서버 컴포넌트
export default async function MemoPage({ params }: MemoPageProps) {
    const userCache = new Map<string, { nickname: string; photo: string | null }>();
    // state
    const { postId } = params;

    const commentQuery = query(collection(db, 'posts', postId, 'comments'))
    const commentSnapshot = await getDocs(commentQuery)

    const commentData: (Comment | undefined)[] = await Promise.all(
        commentSnapshot.docs.map(async (docs) => {
            const comments = {
                id: docs.id,
                ...docs.data(),
                localTimestamp: new Date(docs.data().localTimestamp.seconds * 1000),
                createAt: new Date(docs.data().createAt.seconds * 1000),
            } as Comment

            // 사용자 정보 캐시 처리
            if (!userCache.has(comments.user)) { // userId를 user로 변경
                const userDocRef = doc(db, "users", comments.user); // DocumentReference 생성
                const userDoc = await getDoc(userDocRef); // 문서 데이터 가져오기

                if (userDoc.exists()) {
                    const userData = userDoc.data() as { displayName: string; photoURL: string | null };
                    userCache.set(comments.user, {
                        nickname: userData.displayName,
                        photo: userData.photoURL || null,
                    });
                } else {
                    userCache.set(comments.user, {
                        nickname: "Unknown",
                        photo: null,
                    });
                }
                // 캐시에서 사용자 정보 가져오기
                const userData = userCache.get(comments.user) || { nickname: 'Unknown', photo: null };
                comments.displayName = userData.nickname;
                comments.PhotoURL = userData.photo;

                return comments;
            }
        })
    );

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

    const postAddComment = {
        ...transformedPost,
    }

    // Function
    return (
        <>
            <ClientPost post={postAddComment} />
        </>
    )
}