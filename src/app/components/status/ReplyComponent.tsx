/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { Reply, useAddReply, useDelReply } from "@/app/hook/CommentMutate";
import { repliesToggleState, UsageLimitState, userState } from "@/app/state/PostState";
import { formatDate } from "@/app/utils/formatDate";
import { css } from "@emotion/react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import LoadingWrap from "../LoadingWrap";
import { fetchReplies } from "@/app/utils/fetchPostData";
import { Timestamp } from "firebase/firestore";

interface ReplyProps {
    postId: string;
    commentId: string;
}

export default function ReplyComponent({ postId, commentId }: ReplyProps) {
    const user = useRecoilValue(userState)
    const [replyText, setReplyText] = useState<string>('')
    const [activeReply, setActiveReply] = useState<string | null>(null); // 활성화된 답글 ID
    const [repliesToggle, setReplieToggle] = useRecoilState(repliesToggleState(commentId));

    const [dataLoading, setDataLoading] = useState<boolean>(false);

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
        { data: Reply[]; nextPage: Timestamp | undefined }, // TQueryFnData
        Error, // TError
        InfiniteData<{ data: Reply[]; nextPage: Timestamp | undefined }>,
        string[], // TQueryKey
        Timestamp | undefined // TPageParam
    >({
        retry: false,
        queryKey: ['replies', postId, commentId],
        queryFn: async ({ pageParam }) => {
            try {
                setDataLoading(true);
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

                return fetchReplies(
                    user.uid as string,
                    postId,
                    commentId,
                    pageParam, // 시작 인덱스
                );
            } catch (error) {
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    throw error;
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            } finally {
                setDataLoading(false);
            }
        },
        enabled: repliesToggle,
        getNextPageParam: (lastPage) => { return lastPage.data.length > 4 ? undefined : lastPage?.nextPage }, // 다음 페이지 인덱스 반환
        staleTime: 5 * 60 * 1000, // 5분 동안 데이터 캐싱 유지
        initialPageParam: undefined, // 초기 페이지 파라미터 설정
    });

    useEffect(() => {
        if (isError) {
            console.log('사용 제한!', error.message)
            if (error.message === '사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.') {
                setUsageLimit(true);
            }
        }
    }, [isError])

    const { mutate: addReply } = useAddReply(postId);

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

    const { mutate: delReply } = useDelReply(postId, commentId);

    const handleDelReply = async (commentId: string) => {
        if (user) {
            const confirmed = confirm('댓글을 삭제 하시겠습니까?')
            if (confirmed) {
                try {
                    delReply(commentId);
                } catch (error) {
                    console.error('댓글 삭제 중 오류 발생:', error);
                    alert('댓글 삭제 중 오류가 발생했습니다.');
                }
            }
        }
    }

    const toggleReply = (commentId: string) => {
        setActiveReply((prev) => (prev === commentId ? null : commentId));
    } // 답글 입력 인풋 토글

    const handleMoreReply = () => {
        console.log(hasNextPage, '다음 페이지')
        if (hasNextPage && !isLoading && !usageLimit) {
            fetchNextPage();
        }
    }
    return (
        <>
            <button className="reply_toggle_btn" onClick={() => setReplieToggle(prev => !prev)}>답글 보기</button >
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
                                    <p className="memo_comment_uid">@{reply.uid.slice(0, 8)}...</p>
                                    <button className="comment_delete_btn"
                                        onClick={() => handleDelReply(reply.id)}>
                                        <div className="comment_delete_icon"
                                            css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746003900/%EC%A7%80%EC%9B%8C%EB%B2%84%EB%A6%AC%EA%B8%B0_uiox61.svg)`}
                                        ></div>
                                    </button>
                                </div>
                                <span className="memo_reply_uid">@{reply.displayName}-{reply.uid.slice(0, 3)}...</span>
                                <p className="memo_reply">{reply.commentText}</p>
                                <p className="memo_comment_date">{formatDate(reply.createAt)}</p>
                                <button className="comment_reply_btn" onClick={() => toggleReply(reply.id)}>답글</button>
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
            {dataLoading && <LoadingWrap />}
            {(hasNextPage && !isLoading && !isFetchingNextPage && repliesToggle) &&
                <>{dataLoading ? <LoadingWrap /> : <button className="reply_more_btn" onClick={handleMoreReply}>더 보기</button>}</>
            }
        </>
    )
}