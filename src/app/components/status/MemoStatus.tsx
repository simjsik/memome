/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { Comment, loadingState, UsageLimitState, UsageLimitToggle, userState } from "@/app/state/PostState";
import styled from "@emotion/styled";
import { Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import BookmarkBtn from "../BookmarkBtn";
import { NoMorePost, PostCommentInputStyle, PostCommentStyle } from "@/app/styled/PostComponents";
import { css, useTheme } from "@emotion/react";
import { fetchComments } from "@/app/utils/fetchPostData";
import LoadingWrap from "../LoadingWrap";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Reply, useAddComment, useAddReply, useDelComment } from "@/app/hook/CommentMutate";
import ReplyComponent from "./ReplyComponent";
import { formatDate } from "@/app/utils/formatDate";
import { motion } from "framer-motion";
import { btnVariants } from "@/app/styled/motionVariant";
import { useMediaQuery } from "react-responsive";
import useOutsideClick from "@/app/hook/OutsideClickHook";

interface ClientPostProps {
    post: string;
}

const MemoBox = styled.div<{ btnStatus: boolean }>`
position: relative;
width: 100%;
overflow: hidden;

.user_profile_wrap{
display : flex;
justify-content: space-between;
}

.user_profile_wrap .user_profile{
width : 52px;
height : 52px;
border-radius : 50%;
}

.user_id {
display : block;
margin-top : 8px;
}

.user_id p{
font-size : 18px;
font-family : var(--font-pretendard-bold);
}

.user_id span{
display: block;
width : 70%;
margin-top : 4px;
overflow : hidden;
text-overflow :ellipsis;
font-size : 14px;
font-family : var(--font-pretendard-light);
}

// 프로필
.memo_btn_wrap{
display : flex;
width : 100%;
}

.memo_btn_wrap div{
    width: 100%;
    padding-left: 10px;
    text-align: left;
    background: ${({ theme }) => theme.colors.background};
    font-size: 16px;
    line-height: 38px;
}

.comment_wrap{
border: none;
border-bottom : 2px solid ${({ theme }) => theme.colors.border};
}

.memo_btn{
border: none;
border-bottom : 2px solid ${({ theme }) => theme.colors.border};
}

.status_wrap{
    padding : 10px 0px;
    height: calc(100% - 276px);
    overflow-y: auto;
    overflow-x: hidden;
}

.status_post_list{
display : flex;
justify-content : space-between;
padding : 8px 4px;
border-radius : 4px;
line-height : 18px;
}

& .memo_title:hover{
text-decoration : underline;
cursor:pointer;
}

.memo_img_tag {
width : 18px;
height :18px;
margin-right : 4px;
background : ${({ theme }) => theme.colors.primary};
}

.memo_img_void{
width : 18px;
min-width : 18px;
height : 18px;
margin-right : 4px;
background : none;
}

.memo_title_wrap{
display : flex;
flex : 0 0 65%;
max-width: 210px;
}

.memo_tag {
font-size: 14px;
    color: ${({ theme }) => theme.colors.text_tag};
    margin-right : 2px;
}

.memo_title{
display: block;
width: 60%;
overflow: hidden;
text-overflow: ellipsis;
white-space:nowrap;
font-size : 14px;
font-family : var(--font-pretendard-bold);
}

.memo_date{
flex : 0 0 30%;
text-align: left;
}

.memo_date span{
font-size : 14px;
}
// 스테이터스

.post_bottom{
    height: fit-content;
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.background};
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

    .post_menu_wrap{
        margin-top: 10px;
    }
}

@media (max-width : 480px){
    .post_bottom{
        position : static;
        height: fit-content;
        width: 100%;
        margin-top:auto;
        background-color: ${({ theme }) => theme.colors.background};
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

        .post_menu_wrap{
            margin-top: 10px;
        }
    }

    .status_wrap{
        height: 100%;
    }
}
`
export default function MemoStatus({ post }: ClientPostProps) {
    const theme = useTheme();
    const [commentText, setCommentText] = useState<string>('');
    const [replyText, setReplyText] = useState<string>('');
    const [activeReply, setActiveReply] = useState<string | null>(null); // 활성화된 답글 ID
    const user = useRecoilValue(userState);
    const isMobile = useMediaQuery({ maxWidth: 1200 });

    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle);
    const [commentInputOn, setcommentInputOn] = useState<boolean>(false);
    const observerLoadRef = useRef(null);
    const containerRef = useRef(null);
    const commentInputRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useRecoilState(loadingState);
    // state

    // 댓글 무한 스크롤 로직----------------------------------------------------------------------------
    const {
        data: comment,
        fetchNextPage,
        hasNextPage,
        isLoading: firstLoading,
        isFetching: dataLoading,
        isError,
        error,
    } = useInfiniteQuery<
        { data: Comment[]; nextPage: Timestamp | undefined }, // TQueryFnData
        Error, // TError
        InfiniteData<{ data: Comment[]; nextPage: Timestamp | undefined }>,
        string[], // TQueryKey
        Timestamp | undefined // TPageParam
    >({
        retry: false, // 재시도 방지
        queryKey: ['comments', post],
        queryFn: async ({ pageParam }) => {
            try {
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ uid: user.uid }),
                });
                if (!validateResponse.ok) {
                    const errorDetails = await validateResponse.json();
                    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
                }

                return await fetchComments(user.uid as string, post, pageParam);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    throw error;
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
        initialPageParam: undefined,
    });

    const commentList = comment?.pages.flatMap(page => page.data) || []

    useEffect(() => {
        if (isError) {
            if (error.message === '사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.') {
                setUsageLimit(true);
            }
        }
    }, [isError])

    // // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (usageLimit) {
            if (usageLimit) {
                setLimitToggle(true);
            }
            return;
        }
        const obsever = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !dataLoading) {
                    fetchNextPage();
                }
            },
            {
                root: containerRef.current,              // ⬅ 스크롤 컨테이너를 root로 지정
                threshold: 0.1,
            }
        );

        if (observerLoadRef.current) {
            obsever.observe(observerLoadRef.current);
        }

        return () => {
            if (observerLoadRef.current) obsever.unobserve(observerLoadRef.current);
        };
    }, [hasNextPage, fetchNextPage, containerRef.current, observerLoadRef.current])

    // 초기 데이터 로딩
    useEffect(() => {
        setLoading(false); // 초기 로딩 해제
    }, [])

    const { mutate: addComment, isPending: isAddComment } = useAddComment(post);

    const handleAddComment = async (parentId: string | null = null, commentId: string) => {
        if (user) {
            const text = parentId ? replyText : commentText;
            const uid = user.uid;

            if (!text.trim()) {
                alert(parentId ? '답글을 입력해주세요.' : '댓글을 입력해주세요.');
                return;
            }

            try {
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ uid }),
                });

                if (!validateResponse?.ok) {
                    const errorData = await validateResponse?.json();
                    console.error("Server-to-server error:", errorData.message);
                    throw new Error('유저 검증 실패')
                }

                const commentData =
                    {
                        parentId,
                        replyId: commentId,
                        commentText: text,
                        replyCount: 0,
                    } as Comment

                addComment(commentData);

                setCommentText('');
                setReplyText('');
                setActiveReply(null);
            } catch (error) {
                console.error('댓글 추가 중 오류:', error);
                alert('댓글 추가에 실패했습니다.');
            }
        }
    }

    const { mutate: delComment, isPending: isDelComment } = useDelComment(post);

    const handleDelComment = async (commentId: string) => {
        if (user) {
            try {
                delComment(commentId);
            } catch (error) {
                console.error('댓글 삭제 중 오류 발생:', error);
                alert('댓글 삭제 중 오류가 발생했습니다.');
            }
        }
    }

    const { mutate: addReply, isPending: isAddReply } = useAddReply(post);

    const handleAddReply = async (parentId: string, commentId: string) => {
        if (user) {
            const text = replyText;
            const uid = user.uid;

            if (!text.trim()) {
                alert('답글을 입력해주세요.');
                return;
            }

            try {
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ uid }),
                });

                if (!validateResponse?.ok) {
                    const errorData = await validateResponse?.json();
                    console.error("Server-to-server error:", errorData.message);
                    throw new Error('유저 검증 실패')
                }

                const commentData =
                    {
                        parentId,
                        replyId: commentId,
                        commentText: text,
                    } as Reply

                addReply(commentData);

                setReplyText('');
                setActiveReply(null);
            } catch (error) {
                console.error('댓글 추가 중 오류:', error);
                alert('댓글 추가에 실패했습니다.');
            }
        }
    }

    const toggleReply = (commentId: string) => {
        setActiveReply((prev) => (prev === commentId ? null : commentId));
    } // 답글 입력 인풋 토글

    // 외부 클릭 시 드롭다운 닫기
    useOutsideClick(commentInputRef, () => {
        if (commentText.trim().length < 1) {
            setcommentInputOn(false);
        }
    });
    return (
        <MemoBox btnStatus>
            <div className="memo_btn_wrap">
                <div className="comment_wrap">댓글</div>
            </div>
            <div className="status_wrap" ref={containerRef}>
                <PostCommentStyle>
                    {commentList.filter(comment => !comment.parentId).map(comment => (
                        <div key={comment.id} className="memo_comment_wrap">
                            <div className="user_profile">
                                <div className="user_photo"
                                    css={css`
                                                background-image : url(${comment.photoURL})
                                                `}
                                ></div>
                                <p className="memo_comment_user">{comment.displayName}</p>
                                <p className="memo_comment_uid">@{comment.uid.slice(0, 8)}...</p>
                                <button className="comment_delete_btn"
                                    onClick={() => handleDelComment(comment.id)}>
                                    <div className="comment_delete_icon"
                                        css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746003900/%EC%A7%80%EC%9B%8C%EB%B2%84%EB%A6%AC%EA%B8%B0_uiox61.svg)`}
                                    ></div>
                                </button>
                            </div>
                            <p className="memo_comment">{comment.commentText}</p>
                            <p className="memo_comment_date">{formatDate(comment.createAt)}</p>
                            <motion.button variants={btnVariants(theme)}
                                whileHover="otherHover"
                                whileTap="otherClick"
                                className="comment_reply_btn" onClick={() => toggleReply(comment.id)}>답글</motion.button>
                            {activeReply === comment.id && (
                                <div className="reply_input_wrap">
                                    <textarea
                                        className="comment_input"
                                        placeholder="답글 입력"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <motion.button
                                        variants={btnVariants(theme)}
                                        whileHover="otherHover"
                                        whileTap="otherClick"
                                        className="comment_upload_btn"
                                        onClick={() => handleAddReply(comment.id, comment.id)}
                                    >
                                        등록
                                    </motion.button>
                                </div>
                            )}
                            {comment.replyCount > 0 &&
                                <ReplyComponent postId={post} commentId={comment.id} />
                            }
                        </div>
                    ))}
                    <div ref={observerLoadRef} css={css`height: 1px; visibility: ${(dataLoading || firstLoading) ? "hidden" : "visible"};`} />
                    {(!loading && dataLoading && (isAddComment || isDelComment || isAddReply)) && <LoadingWrap />}
                    {
                        (!hasNextPage && !dataLoading && !loading) &&
                        <>
                            {commentList.length === 0 &&
                                <NoMorePost>
                                    <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1749549274/%EB%AD%94%EA%B0%80%EC%97%86%EC%9D%84%EB%95%8C_bvky0y.svg)`}></div>
                                    <p>댓글이 없습니다.</p>
                                    <span>첫 댓글을 작성해보세요.</span>
                                </NoMorePost>
                            }
                        </>
                    }
                    <div className="post_bottom" ref={commentInputRef}>
                        <div className="post_menu_wrap">
                            <BookmarkBtn postId={post} />
                        </div>
                        {isMobile ?
                            <>
                                {commentInputOn ?
                                    <PostCommentInputStyle>
                                        <div className="login_user_profile">
                                            <div className="login_user_photo"
                                                css={css`background-image : url(${user?.photo})`}
                                            ></div>
                                            <p className="login_user_id">{user?.name}</p>
                                        </div>
                                        <textarea className="comment_input" placeholder="댓글 입력" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                                        <motion.button variants={btnVariants(theme)}
                                            whileHover="otherHover"
                                            whileTap="otherClick"
                                            className="comment_upload_btn" onClick={() => handleAddComment(null, 'comment')}>등록</motion.button>
                                    </PostCommentInputStyle>
                                    :
                                    <motion.button css={
                                        css`
                                            width : 100%;
                                            height : 52px;
                                            background : ${theme.colors.primary};
                                            color : #fff;
                                            border : 1px solid ${theme.colors.border};
                                            border-radius : 4px;
                                            font-size : 1rem;
                                            font-family : var(--font-pretendard-medium);
                                            cursor : pointer;`
                                    }
                                        variants={btnVariants(theme)}
                                        whileHover="otherHover"
                                        whileTap="otherClick"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setcommentInputOn(true) }}>댓글 쓰기</motion.button>
                                }
                            </>
                            :
                            <PostCommentInputStyle>
                                <div className="login_user_profile">
                                    <div className="login_user_photo"
                                        css={css`
                                        background-image : url(${user?.photo})
                                        `}
                                    ></div>
                                    <p className="login_user_id">{user?.name}</p>
                                </div>
                                <textarea className="comment_input" placeholder="댓글 입력" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                                <motion.button variants={btnVariants(theme)}
                                    whileHover="otherHover"
                                    whileTap="otherClick"
                                    className="comment_upload_btn" onClick={() => handleAddComment(null, 'comment')}>등록</motion.button>
                            </PostCommentInputStyle>
                        }

                    </div>
                </PostCommentStyle>
            </div>
        </MemoBox >
    )
}