/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useAddReply, useDelComment } from "@/app/hook/CommentMutate";
import { Comment, repliesToggleState, UsageLimitState, userState } from "@/app/state/PostState";
import { formatDate } from "@/app/utils/formatDate";
import { css } from "@emotion/react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import LoadingWrap from "../LoadingWrap";

interface ReplyProps {
    postId: string;
    commentId: string;
}

export default function ReplyComponent({ postId, commentId }: ReplyProps) {
    const user = useRecoilValue(userState)
    const [replyText, setReplyText] = useState<string>('')
    const [activeReply, setActiveReply] = useState<string | null>(null); // 활성화된 답글 ID
    const [repliesToggle, setReplieToggle] = useRecoilState(repliesToggleState(commentId));
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)

    const {
        data: replies,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        isError,  // 에러 상태
        error,    // 에러 메시지
    } = useInfiniteQuery<
        { data: Comment[]; nextPage: number | undefined }, // TQueryFnData
        Error, // TError
        InfiniteData<{ data: Comment[]; nextPage: number | undefined }>,
        string[], // TQueryKey
        number | undefined // TPageParam
    >({
        retry: false,
        queryKey: ['replies', postId, commentId],
        queryFn: async ({ pageParam }) => {
            const csrf = document.cookie.split('; ').find(c => c?.startsWith('csrfToken='))?.split('=')[1];
            const csrfValue = csrf ? decodeURIComponent(csrf) : '';

            const response = await fetch(`/api/post/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Project-Host': window.location.origin,
                    'x-csrf-token': csrfValue
                },
                body: JSON.stringify({ pageParam, pageSize: 3, postId, commentId, needReply: true }),
                credentials: "include",
            });

            if (!response.ok) {
                // 상태별 메시지
                if (response.status === 429) throw new Error('요청 한도를 초과했어요.');
                if (response.status === 403) throw new Error('유저 인증이 필요합니다.');
                const msg = await response.text().catch(() => '');
                throw new Error(msg || `요청 실패 (${response.status})`);
            }

            const data = await response.json();
            return data
        },
        enabled: repliesToggle,
        getNextPageParam: (lastPage) => { return lastPage.data.length > 4 ? undefined : lastPage?.nextPage }, // 다음 페이지 인덱스 반환
        staleTime: 5 * 60 * 1000, // 5분 동안 데이터 캐싱 유지
        initialPageParam: undefined, // 초기 페이지 파라미터 설정
    });

    useEffect(() => {
        if (isError) {
            if (error.message === '사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.') {
                setUsageLimit(true);
            }
        }
    }, [isError])

    const { mutate: addReply } = useAddReply(postId);

    const handleAddReply = async (parentId: string, replyId: string) => {
        if (user) {
            const text = replyText;

            if (!text.trim()) {
                alert('답글을 입력해주세요.');
                return;
            }

            const comment = {
                parentId,
                replyId,
                commentText: text,
                replyCount: 0,
            } as Comment
            console.log(comment, '답글 컴포넌트 측')
            addReply(comment);

            setReplyText('');
            setActiveReply(null);
        }
    }

    const { mutate: delComment } = useDelComment();

    const handleDelReply = async (commentId: string, replyId: string) => {
        const confirmed = confirm('댓글을 삭제 하시겠습니까?')
        if (!confirmed) return;
        delComment({ commentId, postId, replyId })
    }

    const toggleReply = (commentId: string) => {
        setActiveReply((prev) => (prev === commentId ? null : commentId));
    } // 답글 입력 인풋 토글

    const handleMoreReply = () => {
        if (hasNextPage && !isLoading && !usageLimit) {
            fetchNextPage();
        }
    }

    return (
        <>
            {repliesToggle ?
                <button className="reply_toggle_btn" onClick={() => setReplieToggle(prev => !prev)} aria-label="답글 토글">답글 닫기</button >
                :
                <button className="reply_toggle_btn" onClick={() => setReplieToggle(prev => !prev)} aria-label="답글 토글">답글 보기</button >
            }
            {repliesToggle &&
                <>
                    {replies?.pages.flatMap(page => page.data).map(reply => (
                        <>
                            <div className="reply_wrap" key={reply.id}>
                                <div className="user_profile">
                                    <div className="reply_user_photo"
                                        css={css`
                                            width: 20px;
                                            height : 20px;
                                            background-image : url(${reply.photoURL})
                                        `}
                                    />
                                    <p className="memo_comment_user">{reply.displayName}</p>
                                    <p className="memo_comment_uid">@{reply.userId?.slice(0, 8)}...</p>
                                    <button className="comment_delete_btn"
                                        onClick={() => handleDelReply(reply.parentId!, reply.id)}
                                        aria-label="답글 지우기">
                                        <div className="comment_delete_icon"
                                            css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746003900/%EC%A7%80%EC%9B%8C%EB%B2%84%EB%A6%AC%EA%B8%B0_uiox61.svg)`}
                                        ></div>
                                    </button>
                                </div>
                                <span className="memo_reply_uid">@{reply.displayName}-{reply.userId?.slice(0, 3)}...</span>
                                <p className="memo_reply">{reply.commentText}</p>
                                <time className="memo_comment_date">{formatDate(reply.createAt)}</time>
                                <button className="comment_reply_btn" onClick={() => toggleReply(reply.id)}
                                    aria-label="답글 토글">답글</button>
                                {activeReply === reply.id && (
                                    <div className="reply_input_wrap">
                                        <input
                                            className="comment_input"
                                            type="text"
                                            placeholder="답글 입력"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <button
                                            className="comment_upload_btn"
                                            onClick={() => handleAddReply(commentId, reply.id)}
                                            aria-label="답글 입력"
                                        >
                                            등록
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ))}
                </>
            }
            {isLoading && <LoadingWrap />}
            {((hasNextPage && repliesToggle) && !isFetchingNextPage) &&
                <>{isLoading ? <LoadingWrap /> : <button className="reply_more_btn" onClick={handleMoreReply} aria-label="더 보기">더 보기</button>}</>
            }
        </>
    )
}