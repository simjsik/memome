/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchComments, fetchPostList } from "@/app/api/loadToFirebasePostData/fetchPostData";
import { ADMIN_ID, Comment, memoCommentState, memoList, memoState } from "@/app/state/PostState";
import { HomeBtn } from "@/app/styled/RouterComponents";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { DocumentData, } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

interface ClientPostProps {
    post: DocumentData;
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
export default function Memo({ post }: ClientPostProps) {
    const router = useRouter();
    const ADMIN = useRecoilValue(ADMIN_ID)
    const [memo, setMemo] = useRecoilState<memoList>(memoState)
    const setCommentList = useSetRecoilState<Comment[]>(memoCommentState)
    // state

    const { data: comments = [] } = useQuery({
        queryKey: ['comments', post.postId],
        queryFn: () => fetchComments(post.postId),
        staleTime: 5 * 60 * 1000,
    }); // 댓글 데이터

    const { data: postlist = [] } = useQuery({
        queryKey: ['postlist', post.userId],
        queryFn: () => fetchPostList(post.postId, post.userId),
        staleTime: 5 * 60 * 1000,
    }); // 포스트 데이터

    useEffect(() => {
        if (comments) {
            setCommentList(comments);
        }
    }, [comments]);

    useEffect(() => {
        if (postlist.length > 0 && (memo.list !== postlist || memo.user !== post.userId)) {
            setMemo({ list: postlist, user: post.userId });
        }
        // console.log(postlist)
    }, [postlist]);

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