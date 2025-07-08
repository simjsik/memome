'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminState, Comment, memoCommentCount, userState } from "../state/PostState";
import { addDoc, collection, doc, getDoc, increment, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../DB/firebaseConfig";
import { useRecoilValue, useSetRecoilState } from "recoil";


export interface Reply {
    id: string;
    replyId: string;
    uid: string;
    commentText: string;
    createAt: Timestamp;
    parentId: string | null;
    displayName: string,
    photoURL: string | null,
}

export function useAddComment(
    postId: string,
) {
    const queryClient = useQueryClient();
    const user = useRecoilValue(userState); // 사용자 정보 훅
    const setCommentCount = useSetRecoilState(memoCommentCount);

    return useMutation<Comment, Error, Comment>({
        mutationFn: async (newComment) => {
            // firebase에 추가
            const commentRef = await addDoc(collection(db, `posts/${postId}/comments`), {
                ...newComment,
                uid: user.uid,
                createAt: Timestamp.now(),
            });

            setCommentCount(prev => prev + 1);
            return {
                ...newComment,
                id: commentRef.id,
                uid: user.uid,
                displayName: user.name,
                photoURL: user.photo,
                createAt: Timestamp.now(),
            } as Comment;
        },
        onSuccess: (savedComment) => {
            queryClient.setQueryData<InfiniteData<{ data: Comment[]; nextPage: Timestamp | undefined }>>(
                ['comments', postId],
                (old) => {
                    if (!old) return old;
                    const [firstPage, ...rest] = old.pages;
                    return {
                        ...old,
                        pages: [
                            { data: [...firstPage.data, savedComment], nextPage: firstPage.nextPage },
                            ...rest,
                        ],
                        pageParams: old.pageParams,
                    };
                }
            );
        },
    });
}

export function useAddReply(
    postId: string,
) {
    const queryClient = useQueryClient();
    const user = useRecoilValue(userState); // 사용자 정보 훅
    const setCommentCount = useSetRecoilState(memoCommentCount);

    return useMutation<Reply, Error, Reply>({
        mutationFn: async (reply) => {
            // firebase에 추가
            const replyRef = await addDoc(collection(db, `posts/${postId}/comments/${reply.parentId}/reply`), {
                ...reply,
                uid: user.uid,
                createAt: Timestamp.now(),
            });

            setCommentCount(prev => prev + 1);
            return {
                ...reply,
                id: replyRef.id,
                uid: user.uid,
                displayName: user.name,
                photoURL: user.photo,
                createAt: Timestamp.now(),
            } as Reply;
        },
        onSuccess: (savedReply) => {
            queryClient.setQueryData<InfiniteData<{ data: Reply[]; nextPage: Timestamp | undefined }>>(
                ['replies', postId, savedReply.parentId],
                (old) => {
                    if (!old) return old;
                    const [firstPage, ...rest] = old.pages;
                    return {
                        ...old,
                        pages: [
                            { data: [...firstPage.data, savedReply], nextPage: firstPage.nextPage },
                            ...rest,
                        ],
                        pageParams: old.pageParams,
                    };
                }
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', postId],
            });
        },
    });
}

export function useDelComment(
    postId: string,
) {
    const queryClient = useQueryClient();
    const user = useRecoilValue(userState);
    const ADMIN = useRecoilValue(adminState);

    return useMutation<void, Error, string>({
        onMutate: async (commentId) => {
            queryClient.setQueryData<InfiniteData<{ data: Comment[], nextPage: Timestamp | undefined }>>(
                ['comments', postId],
                old => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map(p => ({
                            ...p,
                            data: p.data.filter(c => c.id !== commentId && c.parentId !== commentId)
                        }))
                    };
                }
            );
        },
        mutationFn: async (commentId) => {
            const docRef = doc(db, 'posts', postId, 'comments', commentId);
            const docSnapshot = await getDoc(docRef);
            if (!docSnapshot.exists()) {
                throw new Error("NF") // NOT FOUND
            }
            const commentData = docSnapshot.data();
            const commentOwnerId = commentData.uid;

            if (user.uid !== commentOwnerId &&!ADMIN) {
                throw new Error('FB'); // FORBIDDEN
            }

            const confirmed = confirm('댓글을 삭제 하시겠습니까?')
            if (!confirmed) return;

            const batch = writeBatch(db);

            batch.delete(docRef);

            // 댓글 수 수정: 현재 댓글과 답글 수를 계산
            const postRef = doc(db, 'posts', postId)
            batch.update(postRef, { commentCount: increment(-1 - commentData.replyCount) });

            await batch.commit();
        },
        onError: (err) => {
            if (err.message === 'NF') {
                return alert('해당 댓글을 찾을 수 없습니다.');
            } else if (err.message === 'FB') {
                return alert('삭제 권한이 없습니다.');
            } else {
                return alert('댓글 삭제에 실패했습니다.');
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', postId],
            });
        },
    });
}

export function useDelReply(
    postId: string,
    parentId: string
) {
    const queryClient = useQueryClient();
    const user = useRecoilValue(userState);
    const ADMIN = useRecoilValue(adminState);

    return useMutation<void, Error, string>({
        onMutate: (replyId) => {
            queryClient.setQueryData<InfiniteData<{ data: Reply[], nextPage: Timestamp | undefined }>>(
                ['replies', postId, parentId],
                old => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map(p => ({
                            ...p,
                            data: p.data.filter(r => r.id !== replyId)
                        }))
                    };
                }
            );
        },
        mutationFn: async (replyId) => {
            const replyRef = doc(db, 'posts', postId, 'comments', parentId, 'reply', replyId);
            const replySnap = await getDoc(replyRef);
            if (!replySnap.exists()) {
                throw new Error("NF") // NOT FOUND
            }
            const replyData = replySnap.data();
            const replyOwnerId = replyData.uid;

            if (user.uid !== replyOwnerId && !ADMIN) {
                throw new Error('FB'); // FORBIDDEN
            }

            const batch = writeBatch(db);
            batch.delete(replyRef);

            await batch.commit();
        },
        onError: (err) => {
            if (err.message === 'NF') {
                return alert('해당 답글을 찾을 수 없습니다.');
            } else if (err.message === 'FB') {
                return alert('삭제 권한이 없습니다.');
            } else {
                return alert('답글 삭제에 실패했습니다.');
            }
        },
        onSuccess: () => {
            alert('삭제되었습니다');
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', postId],
            });
        },
    });
}