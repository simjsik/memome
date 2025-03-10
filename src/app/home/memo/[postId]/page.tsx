import { db } from "@/app/DB/firebaseConfig";
import { doc, getDoc, Timestamp, } from "firebase/firestore";
import ClientPost from './ClientPost';
import { fetchComments } from "@/app/utils/fetchPostData";
import styled from "@emotion/styled";

export const dynamic = "force-dynamic"; // 정적 렌더링 설정
export const revalidate = 600; // 정적 렌더링 설정

interface MemoPageProps {
    params: {
        postId: string;
    };
}

const PostDetailWrap = styled.div`
position : absolute;
left : 420px;
width : 860px;
padding : 40px;
background : #fff;
border-left : 1px solid #dedede;
border-right : 1px solid #dedede;

// 기본

.post_title_wrap{
display : flex;
justify-content: space-between;
margin-top :12px;
padding-bottom : 10px;
border-bottom: 1px solid #dedede
}

.post_category{
font-size : 16px;
font-family : var(--font-pretendard-light);
color: #acacac;
}

.post_title{
font-size : 18px;
line-height : 32px;
font-family : var(--font-pretendard-bold);
}
.user_id{
display : flex;
}
.user_profile {
width : 32px;
height : 32px;
margin-right : 8px;
border-radius : 50%;
background-size: cover;
background-repeat: no-repeat;
}

.user_id p{
font-size : 12px;
line-height : 32px;
}
.post_content_wrap{
margin-top : 40px;
padding-bottom : 200px;
}
img {
max-width: 780px;
object-fit : cover;
}

.post_menu_wrap{
height : 32px;
display : flex;
justify-content : space-between;
}
.comment_toggle_btn{
width : 60px;
height : 32px;
border : 1px solid #ededed;
background : none;
}

.comment_dlt_btn{
width: 24px;
height : 24px;
background : red;
}
`

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

    const formatDate = (createAt: Timestamp | Date | string | number) => {
        if ((createAt instanceof Timestamp)) {
            return createAt.toDate().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\. /g, '.');
        } else {
            const date = new Date(createAt);

            const format = date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
            return format;
        }
    }
    // Function
    return (
        <>
            <ClientPost comment={comments} />
            <PostDetailWrap>
                <div>
                    <span className="post_category">{post.tag}</span>
                    <div className="post_title_wrap">
                        <p className="post_title">
                            {post.title}
                        </p>
                        <div className="user_id">
                            <div className="user_profile"
                                style={{backgroundImage : `url(${transformedPost.photoURL})`}}
                            ></div>
                            <p>
                                {transformedPost.displayName} · {formatDate(post.createAt)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="post_content_wrap" dangerouslySetInnerHTML={{ __html: post?.content }}></div>
            </PostDetailWrap>
        </>
    )
}