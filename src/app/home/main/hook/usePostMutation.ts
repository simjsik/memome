'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostData } from '../../../state/PostState';
import { Timestamp } from "firebase/firestore";

export function useAddUpdatePost(options?: { onAcknowledge?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation<PostData[], Error, void>({
        mutationFn: async () => {
            // firebase에 추가
            try {
                const csrf = document.cookie.split('; ').find(c => c?.startsWith('csrfToken='))?.split('=')[1];
                const csrfValue = csrf ? decodeURIComponent(csrf) : '';

                const cached = queryClient.getQueryData<InfiniteData<{ data: PostData[], nextPage?: Timestamp }>>(['posts']);

                const newest = cached?.pages?.[0]?.data?.[0]?.createAt;
                const newestId = cached?.pages?.[0]?.data?.[0]?.id ?? null;

                const response = await fetch(`/api/update/post`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Project-Host': window.location.origin,
                        'x-csrf-token': csrfValue
                    },
                    body: JSON.stringify({ newest, newestId }),
                    credentials: "include",
                });

                if (!response.ok) {
                    // 상태별 메시지
                    if (response.status === 429) throw new Error('요청 한도를 초과했어요.');
                    if (response.status === 403) throw new Error('유저 인증이 필요합니다.');
                    const msg = await response.text().catch(() => '');
                    throw new Error(msg || `요청 실패 (${response.status})`);
                }

                const { data: postWithUser } = await response.json();

                return postWithUser
                // 업데이트 플래그 초기화
            } catch (error) {
                console.error("Error fetching new posts:", error);
                throw error;
            }
        },
        onSuccess: (updatesPost: PostData[]) => {
            if (updatesPost.length === 0) {
                options?.onAcknowledge?.();
                return;
            }
            queryClient.setQueryData<InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>>(
                ['posts'], (old) => {
                    if (!old) return old;

                    const firstPage = old.pages[0];
                    const restPage = old.pages.slice(1);
                    return {
                        ...old,
                        pages: [
                            {
                                data: [...updatesPost, ...firstPage.data],
                                nextPage: firstPage.nextPage,
                            },
                            ...restPage,
                        ],
                        pageParams: old.pageParams,
                    };
                }
            );
            options?.onAcknowledge?.();
        },
        onError: (err) => {
            console.error('포스트 갱신 실패:', err);
        }
    });
}
