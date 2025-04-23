'use client';
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_ID, Comment, memoCommentCount, memoCommentState, userState } from "../state/PostState";
import { addDoc, collection, doc, getDoc, getDocs, increment, query, runTransaction, Timestamp, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../DB/firebaseConfig";
import { useRecoilValue, useSetRecoilState } from "recoil";

interface NewComment {
    replyId: string;
    uid: string;
    commentText: string;
    createAt: Timestamp;
    parentId: string | null;
    displayName: string,
    photoURL: string | null,
}

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
    const setCommentList = useSetRecoilState(memoCommentState);
    const setCommentCount = useSetRecoilState(memoCommentCount);

    return useMutation<Comment, Error, NewComment>({
        mutationFn: async (newComment) => {
            // firebase에 추가
            const commentRef = await addDoc(collection(db, `posts/${postId}/comments`), {
                ...newComment,
                uid: user.uid,
                createAt: Timestamp.now(),
            });

            // 댓글 수 수정
            await updateDoc(doc(db, 'posts', postId), {
                commentCount: increment(1),
            });

            setCommentCount(prev => prev + 1);
            return {
                id: commentRef.id,
                ...newComment,
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

            setCommentList((prev) => [
                ...prev,
                savedComment as Comment
            ]);
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
            const commentRef = doc(db, `posts/${postId}/comments/${reply.parentId}`);
            console.log(postId, reply.parentId, '답글 작성 시 댓글 및 포스트 데이터');
            const replyRef = await addDoc(collection(db, `posts/${postId}/comments/${reply.parentId}/reply`), {
                ...reply,
                uid: user.uid,
                createAt: Timestamp.now(),
            });

            // 댓글 수와 댓글의 답글 수 업데이트를 모두 보장하기 위해 트랜잭션 사용
            await runTransaction(db, async (cd) => {
                const postSnap = await cd.get(doc(db, 'posts', postId));
                const commentSnap = await cd.get(commentRef);

                if (!postSnap.exists() || !commentSnap.exists()) {
                    throw new Error('댓글이 삭제되었거나 존재하지 않는 게시글 입니다.');
                }

                cd.update(doc(db, 'posts', postId), { commentCount: increment(1) });
                cd.update(commentRef, { replyCount: increment(1) });
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
    });
}

export function useDelComment(
    postId: string,
) {
    const queryClient = useQueryClient();
    const user = useRecoilValue(userState);
    const ADMIN = useRecoilValue(ADMIN_ID);
    const setCommentList = useSetRecoilState(memoCommentState);
    const setCommentCount = useSetRecoilState(memoCommentCount);

    return useMutation<void, Error, string>({
        mutationFn: async (commentId) => {
            const docRef = doc(db, 'posts', postId, 'comments', commentId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                alert('해당 댓글을 찾을 수 없습니다.');
                return;
            }

            const commentOwnerId = docSnap.data()?.uid;

            if (user.uid === commentOwnerId || user.uid === ADMIN) {
                const batch = writeBatch(db);

                batch.delete(docRef);

                const repliesQuery = query(collection(db, 'posts', postId, 'comments', commentId, 'reply'));
                const replySnapshot = await getDocs(repliesQuery);
                replySnapshot.docs.forEach(dc => batch.delete(dc.ref));


                // 댓글 수 수정: 현재 댓글과 답글 수를 계산
                const postRef = doc(db, 'posts', postId)
                batch.update(postRef, { commentCount: increment(-1 - replySnapshot.size) });

                await batch.commit();

                setCommentList((prevComments) => prevComments.filter(comment =>
                    comment.id !== commentId && comment.parentId !== commentId
                ));
                setCommentCount(prev => prev - 1 - replySnapshot.size)
            } else {
                alert('댓글 삭제 권한이 없습니다.');
                return;
            }
        },
        onSuccess: (_, commentId) => {
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
            alert('삭제되었습니다');
        }
    });
}

export function useDelReply(
    postId: string,
    parentId: string
) {
    const queryClient = useQueryClient();
    const user = useRecoilValue(userState);
    const ADMIN = useRecoilValue(ADMIN_ID);
    const setCommentCount = useSetRecoilState(memoCommentCount);

    return useMutation<void, Error, string>({
        mutationFn: async (replyId) => {
            const replyRef = doc(db, 'posts', postId, 'comments', parentId, 'reply', replyId);
            const replySnap = await getDoc(replyRef);

            if (!replySnap.exists()) {
                alert('해당 댓글을 찾을 수 없습니다.');
                return;
            }

            const commentOwnerId = replySnap.data()?.uid;

            if (user.uid === commentOwnerId || user.uid === ADMIN) {
                const batch = writeBatch(db);
                batch.delete(replyRef);

                const postRef = doc(db, 'posts', postId);
                const commentRef = doc(db, 'posts', postId, 'comments', parentId);

                batch.update(postRef, { commentCount: increment(-1) });
                batch.update(commentRef, { replyCount: increment(-1) });

                await batch.commit();
                setCommentCount(prev => prev - 1);
            } else {
                alert('댓글 삭제 권한이 없습니다.');
                return;
            }
        },
        onSuccess: (_, replyId) => {
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
            alert('삭제되었습니다');
        }
    });
}