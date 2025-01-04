/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchComments } from "@/app/api/loadToFirebasePostData/fetchPostData";
import { checkUsageLimit } from "@/app/api/utils/checkUsageLimit";
import { ADMIN_ID, Comment, memoCommentCount, memoCommentState, memoList, memoState, UsageLimitState, userData, userState } from "@/app/state/PostState";
import { HomeBtn } from "@/app/styled/RouterComponents";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { DocumentData, } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

interface ClientPostProps {
    post: DocumentData;
    comment: Comment[];
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
export default function Memo({ post, comment }: ClientPostProps) {
    const router = useRouter();
    const setCommentList = useSetRecoilState<Comment[]>(memoCommentState)
    const setCommentCount = useSetRecoilState<number>(memoCommentCount)
    const [currentUser, setCurrentUser] = useRecoilState<userData | null>(userState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)

    // state

    // 사용량 확인
    useEffect(() => {
        if (currentUser) {
            const checkLimit = async () => {
                try {
                    await checkUsageLimit(currentUser.uid);
                } catch (err: any) {
                    if (err.message.includes('사용량 제한')) {
                        setUsageLimit(true);
                    } else {
                        console.log('사용량을 불러오는 중 에러가 발생했습니다.');
                    }
                }
            }
            checkLimit();
        } else {
            console.log('제한 안함')
        }
    }, [])

    useEffect(() => {
        if (comment) {
            setCommentList(comment);
            setCommentCount(comment.length);
        }
    }, [comment]);

    const handleHomeBtn = () => {
        router.push('/home/main')
    }

    const formatDate = (createAt: any) => {
        if (createAt?.toDate) {
            return createAt.toDate().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\. /g, '.');
        } else if (createAt?.seconds) {
            return new Date(createAt.seconds * 1000).toLocaleDateString('ko-KR', {
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
            <HomeBtn onClick={handleHomeBtn} />
            <PostDetailWrap>
                <div>
                    <span className="post_category">{post.tag}</span>
                    <div className="post_title_wrap">
                        <p className="post_title">
                            {post.title}
                        </p>
                        <div className="user_id">
                            <div className="user_profile"
                                css={css`background-image : url(${post.photoURL})`}
                            ></div>
                            <p>
                                {post.displayName} · {formatDate(post.createAt)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="post_content_wrap" dangerouslySetInnerHTML={{ __html: post?.content }}></div>
            </PostDetailWrap>
        </>
    );
}