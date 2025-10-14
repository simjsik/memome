'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostData } from '../../../state/PostState';
import { Timestamp } from "firebase/firestore";

export function useAddNewPost(checkedNotice: boolean) {
    const queryClient = useQueryClient();

    return useMutation<PostData, Error, PostData>({
        onMutate: async (newPost) => {
            const tag = checkedNotice ? 'notices' : 'posts';

            queryClient.setQueryData<InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>>(
                [tag], (old) => {
                    if (!old) return old;

                    const firstPage = old.pages[0];
                    const restPage = old.pages.slice(1);

                    return {
                        ...old,
                        pages: [
                            {
                                data: [newPost, ...firstPage.data],
                                nextPage: firstPage.nextPage,
                            },
                            ...restPage,
                        ],
                        pageParams: old.pageParams,
                    };
                }
            );
        },
        mutationFn: async (newPost: PostData) => {
            // firebase에 추가
            try {
                return newPost
                // 업데이트 플래그 초기화
            } catch (error) {
                console.error("Error fetching new posts:", error);
                throw error;
            }
        },
        onSuccess: () => {
            const tag = checkedNotice ? 'notice' : 'posts';
            queryClient.invalidateQueries({ queryKey: [tag] });
            localStorage.removeItem('unsavedPost');
            alert('포스팅 완료');
        },
    });
}

export function useDelPost() {
    const queryClient = useQueryClient();

    return useMutation<string, Error, string>({
        mutationFn: async (postId: string) => {
            const csrf = document.cookie.split('; ').find(c => c?.startsWith('csrfToken='))?.split('=')[1];
            const csrfValue = csrf ? decodeURIComponent(csrf) : '';

            const deleteResponse = await fetch(`/api/post/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Project-Host': window.location.origin,
                    'x-csrf-token': csrfValue
                },
                body: JSON.stringify({ postId }),
                credentials: "include",
            });

            if (!deleteResponse.ok) {
                throw new Error('게시글 삭제 실패'); // FORBIDDEN
            }

            return postId;
        },
        onError: (err) => {
            console.log('게시글 삭제 실패 :' + err)
            alert('게시글 삭제에 실패했습니다.');
            return;
        },
        onSuccess: (postId) => {
            ['posts', 'notices', 'bookmarks'].forEach((key) => {
                queryClient.setQueryData<InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>>(
                    [key], (old) => {
                        if (!old) return old;

                        // 모든 페이지 순회하며 post.id === postId 인 항목만 걸러내기
                        const updatedPages = old.pages.map((page) => ({
                            data: page.data.filter((post) => post.id !== postId),
                            nextPage: page.nextPage,
                        }));

                        // 빈 페이지는 제거하거나, 빈 배열을 유지할지 결정
                        const filteredPages = updatedPages.filter((page) => page.data.length > 0);

                        return {
                            pages: filteredPages,
                            pageParams: old.pageParams, // 커서는 그대로 유지
                        };
                    }
                );
            });
            alert('삭제되었습니다');
        },
    });
}
