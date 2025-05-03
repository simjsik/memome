'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostData } from '../../../state/PostState';
import { Timestamp } from "firebase/firestore";

export function useAddNewPost() {
    const queryClient = useQueryClient();

    return useMutation<PostData, Error, PostData>({
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
        onSuccess: (newPost: PostData) => {
            queryClient.setQueryData<InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>>(
                ['posts'], (old) => {
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
    });
}
