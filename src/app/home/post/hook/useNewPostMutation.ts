'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminState, PostData, userState } from '../../../state/PostState';
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import { useRecoilValue } from "recoil";

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
    const user = useRecoilValue(userState);
    const ADMIN = useRecoilValue(adminState);

    return useMutation<void, Error, string>({
        mutationFn: async (postId: string) => {
            // 게시글 존재 확인
            const postDoc = await getDoc(doc(db, 'posts', postId));
            if (!postDoc.exists()) {
                throw new Error("NF") // NOT FOUND
            }

            const postOwnerId = postDoc.data()?.userId;

            if (user.uid !== postOwnerId && !ADMIN) {
                throw new Error('FB'); // FORBIDDEN
            }

            await deleteDoc(doc(db, 'posts', postId));
        },
        onError: (err) => {
            if (err.message === 'NF') {
                alert('해당 게시글을 찾을 수 없습니다.')
            } else if (err.message === 'FB') {
                alert('삭제 권한이 없습니다.');
            } else {
                alert('게시글 삭제에 실패했습니다.');
            };
            return
        },
        onMutate: (postId) => {
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
        },
        onSuccess: () => {
            alert('삭제되었습니다');
        },
    });
}
