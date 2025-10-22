'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment } from "../state/PostState";

export function useAddComment(
    postId: string,
) {
    const queryClient = useQueryClient();

    return useMutation<Comment, Error, Comment>({
        onMutate: async (newComment) => {
            queryClient.setQueryData<InfiniteData<{ data: Comment[]; nextPage: number | undefined }>>(
                ['comments', postId],
                (old) => {
                    if (!old) return old;
                    const [firstPage, ...rest] = old.pages;
                    return {
                        ...old,
                        pages: [
                            { data: [...firstPage.data, newComment], nextPage: firstPage.nextPage },
                            ...rest,
                        ],
                        pageParams: old.pageParams,
                    };
                }
            );
        },
        mutationFn: async (newComment: Comment) => {
            try {
                return newComment
                // 업데이트 플래그 초기화
            } catch (error) {
                console.error("Error fetching new posts:", error);
                throw error;
            }
        },
    });
}

export function useAddReply(
    postId: string,
) {
    const queryClient = useQueryClient();

    return useMutation<Comment, Error, Comment>({
        onMutate: async (newComment) => {
            queryClient.setQueryData<InfiniteData<{ data: Comment[]; nextPage: number | undefined }>>(
                ['replies', postId, newComment.parentId],
                (old) => {
                    if (!old) return old;
                    const [firstPage, ...rest] = old.pages;
                    return {
                        ...old,
                        pages: [
                            { data: [...firstPage.data, newComment], nextPage: firstPage.nextPage },
                            ...rest,
                        ],
                        pageParams: old.pageParams,
                    };
                }
            );
        },
        mutationFn: async (newComment) => {
            try {
                return newComment
                // 업데이트 플래그 초기화
            } catch (error) {
                console.error("Error fetching new posts:", error);
                throw error;
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', postId],
            });
        },
    });
}

export function useDelComment() {
    const queryClient = useQueryClient();
    type PageParam = { data: Comment[]; nextPage: number | undefined };
    type InfData = InfiniteData<PageParam>;

    const removeCompactInfinite = (
        old: InfData | undefined,
        targetId: string,
    ): InfData | undefined => {
        if (!old) return old;

        const updatedPages = old.pages.map((page) => ({
            data: page.data.filter((data) => data.id !== targetId),
            nextPage: page.nextPage,
        })); // 각 페이지 별로 돌면서 일치하는 포스트 제거

        let lastNonEmptyIndex = -1;
        for (let i = updatedPages.length - 1; i >= 0; i--) {
            if (updatedPages[i].data.length > 0) {
                lastNonEmptyIndex = i;
                break // 데이터가 있는 첫 페이지 찾기.
            }
        }

        const mappedPage = updatedPages.slice(0, lastNonEmptyIndex + 1);
        const mappedParams = old.pageParams.slice(0, lastNonEmptyIndex + 1);

        return { pages: mappedPage, pageParams: mappedParams };
    };

    return useMutation<void, Error, { postId: string; commentId: string; replyId?: string }>({
        mutationFn: async ({ postId, commentId, replyId }) => {
            const csrf = document.cookie.split('; ').find(c => c?.startsWith('csrfToken='))?.split('=')[1];
            const csrfValue = csrf ? decodeURIComponent(csrf) : '';

            return replyId ? deleteReplyAPI(postId, commentId, replyId, csrfValue) :
                deleteCommentAPI(postId, commentId, csrfValue);
        },
        onError: (err) => {
            console.log('댓글 삭제 실패 :' + err);
            alert('댓글 삭제에 실패했습니다.');
            return;
        },
        onSuccess: (_, { postId, commentId, replyId }) => {
            const targetId = replyId ?? commentId;
            const prefix = replyId ? ['replies', postId, commentId] : ['comments', postId];

            queryClient.setQueriesData({ queryKey: prefix }, (old?: InfData) => removeCompactInfinite(old, targetId));
        },
    });
}

export async function deleteCommentAPI(postId: string, commentId: string, csrfValue: string) {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Project-Host': window.location.origin,
            'x-csrf-token': csrfValue
        },
        credentials: "include",
    });
    if (!res.ok) throw new Error('댓글 삭제 실패');
}

export async function deleteReplyAPI(postId: string, commentId: string, replyId: string, csrfValue: string) {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Project-Host': window.location.origin,
            'x-csrf-token': csrfValue
        },
        credentials: "include",
    });
    if (!res.ok) throw new Error('답글 삭제 실패');
}