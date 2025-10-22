'use client';
import { InfiniteData, QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostData } from '../../../state/PostState';

export function useAddNewPost(checkedNotice: boolean) {
    const queryClient = useQueryClient();

    return useMutation<PostData, Error, PostData>({
        onMutate: async (newPost) => {
            const tag = checkedNotice ? 'notices' : 'posts';

            queryClient.setQueryData<InfiniteData<{ data: PostData[]; nextPage: number | undefined }>>(
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

    type PageParam = { data: PostData[]; nextPage: number | undefined };
    type InfData = InfiniteData<PageParam>;

    const removePostFromInfinite = (
        old: InfData | undefined,
        postId: string,
    ): InfData | undefined => {
        if (!old) return old;
        const updatedPages = old.pages.map((page) => ({
            data: page.data.filter((post) => post.id !== postId),
            nextPage: page.nextPage,
        })); // 각 페이지 별로 돌면서 일치하는 포스트 삭제

        const keptIdx: number[] = [];

        const compactedPages = updatedPages.filter((page, i) => {
            const keep = page.data.length > 0;
            if (keep) keptIdx.push(i);
            return keep;
        });

        const compactedPageParams = old.pageParams.filter((_, i) =>
            keptIdx.includes(i)
        );

        return { pages: compactedPages, pageParams: compactedPageParams };
    };

    const patchAllByPrefix = (
        prefix: QueryKey,
        updater: (old: InfData | undefined) => InfData | undefined
    ) => {
        const targets = queryClient.getQueriesData<InfData>({
            queryKey: prefix,
            exact: false,
        });

        targets.forEach(([queryKey]) => {
            queryClient.setQueryData<InfData>(queryKey, updater);
        });
    };

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
            const updater = (old?: InfData) => removePostFromInfinite(old, postId);

            const prefixes: QueryKey[] = [
                ['posts'],
                ['notices'],
                ['bookmarks'],
                ['postList'],
                ['ImagePostList'],
            ];

            prefixes.forEach((p) => patchAllByPrefix(p, updater));

            alert('삭제되었습니다');
        },
    });
}
