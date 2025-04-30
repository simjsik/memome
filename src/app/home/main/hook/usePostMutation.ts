'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostData } from '../../../state/PostState';
import { collection, doc, getDoc, getDocs, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore";
import { db } from "../../../DB/firebaseConfig";
import { usePostUpdateChecker } from "../../../hook/ClientPolling"

export function useAddUpdatePost() {
    const queryClient = useQueryClient();
    const { clearUpdate } = usePostUpdateChecker();

    return useMutation<PostData[], Error, void>({
        mutationFn: async () => {
            // firebase에 추가
            try {

                const cached = queryClient.getQueryData<InfiniteData<{ data: PostData[], nextPage?: Timestamp }>>(['posts']);
                const newest = cached?.pages?.[0]?.data?.[0]?.createAt;  // Timestamp

                const postsRef = collection(db, "posts");

                const postsQuery = query(
                    postsRef,
                    where('notice', '==', false),
                    orderBy('createAt', 'asc'),
                    startAfter(newest) // 마지막 시간 이후
                );

                const querySnapshot = await getDocs(postsQuery);

                const userCache = new Map<string, { nickname: string; photo: string | null }>();

                const updatePostlist = await Promise.all(
                    querySnapshot.docs.map(async (docs) => {
                        const postData = { id: docs.id, ...docs.data() } as PostData;

                        // 유저 정보 캐싱 및 가져오기
                        if (!userCache.has(postData.userId)) {
                            const userDocRef = doc(db, "users", postData.userId);
                            const userDoc = await getDoc(userDocRef);

                            if (userDoc.exists()) {
                                const userData = userDoc.data() as { displayName: string; photoURL: string | null };
                                userCache.set(postData.userId, {
                                    nickname: userData.displayName,
                                    photo: userData.photoURL || null,
                                });
                            } else {
                                userCache.set(postData.userId, {
                                    nickname: "Unknown",
                                    photo: null,
                                });
                            }
                        }

                        // 매핑된 유저 정보 추가
                        const userData = userCache.get(postData.userId) || { nickname: "Unknown", photo: null };
                        postData.displayName = userData.nickname;
                        postData.photoURL = userData.photo;

                        return postData;
                    })
                );

                clearUpdate();

                return updatePostlist
                // 업데이트 플래그 초기화

            } catch (error) {
                console.error("Error fetching new posts:", error);
                throw error;
            }
        },
        onSuccess: (updatesPost: PostData[]) => {
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
        },
    });
}
