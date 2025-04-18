/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { db } from "@/app/DB/firebaseConfig";
import { ADMIN_ID, Comment, DidYouLogin, memoCommentCount, memoCommentState, userState } from "@/app/state/PostState";
import styled from "@emotion/styled";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, orderBy, query, startAfter, Timestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import BookmarkBtn from "../BookmarkBtn";
import { PostCommentInputStyle, PostCommentStyle } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { useCommentUpdateChecker } from "@/app/hook/ClientPolling";

interface ClientPostProps {
    post: string;
}

const MemoBox = styled.div<{ btnStatus: boolean }>`
position: relative;
width: 100%;
overflow: hidden;

.user_profile_wrap{
display : flex;
justify-content: space-between;
}

.user_profile_wrap .user_profile{
width : 52px;
height : 52px;
border-radius : 50%;
}

.user_id {
display : block;
margin-top : 8px;
}

.user_id p{
font-size : 18px;
font-family : var(--font-pretendard-bold);
}

.user_id span{
display: block;
width : 70%;
margin-top : 4px;
overflow : hidden;
text-overflow :ellipsis;
font-size : 14px;
font-family : var(--font-pretendard-light);
}

// 프로필
.memo_btn_wrap{
display : flex;
width : 100%;
}

.memo_btn_wrap div{
    width: 100%;
    padding-left: 10px;
    text-align: left;
    background: #fff;
    font-size: 16px;
    line-height: 38px;
}

.comment_wrap{
border: none;
border-bottom : ${(props) => (props.btnStatus ? '2px solid #191919' : '2px solid #dedede')};
}

.memo_btn{
border: none;
border-bottom : ${(props) => (props.btnStatus ? '2px solid #dedede' : '2px solid #191919')};
}

.status_wrap{
padding : 10px 0px;
height: calc(100% - 276px);
overflow-y: auto;
overflow-x: hidden;
}

.status_post_list{
display : flex;
justify-content : space-between;
padding : 8px 4px;
border-radius : 4px;
line-height : 18px;
}

& .status_wrap>div:hover {
background : #fdfdfd;
}

& .memo_title:hover{
text-decoration : underline;
cursor:pointer;
}

.memo_img_tag {
width : 18px;
height :18px;
margin-right : 4px;
background : #0087ff;
}

.memo_img_void{
width : 18px;
min-width : 18px;
height : 18px;
margin-right : 4px;
background : none;
}

.memo_title_wrap{
display : flex;
flex : 0 0 65%;
max-width: 210px;
}

.memo_tag {
font-size: 14px;
    color: #777;
    margin-right : 2px;
}

.memo_title{
display: block;
width: 60%;
overflow: hidden;
text-overflow: ellipsis;
white-space:nowrap;
font-size : 14px;
font-family : var(--font-pretendard-bold);
}

.memo_date{
flex : 0 0 30%;
text-align: left;
}

.memo_date span{
font-size : 14px;
}
// 스테이터스

.post_bottom{
    height: fit-content;
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: 100%;
    background-color: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

    .post_menu_wrap{
        margin-top: 10px;
    }
}
`
export default function MemoStatus({ post }: ClientPostProps) {
    const [commentList, setCommentList] = useRecoilState<Comment[]>(memoCommentState)
    const [commentCount, setCommentCount] = useRecoilState<number>(memoCommentCount)
    const [lastFetchedAt, setLastFetchedAt] = useState<Timestamp | { seconds: number; nanoseconds: number } | null>(null); // 마지막으로 문서 가져온 시간
    const [commentText, setCommentText] = useState<string>('')
    const [replyText, setReplyText] = useState<string>('')
    const [activeReply, setActiveReply] = useState<string | null>(null); // 활성화된 답글 ID
    const user = useRecoilValue(userState)
    const hasLogin = useRecoilValue(DidYouLogin)
    const ADMIN = useRecoilValue(ADMIN_ID)
    // state

    const formatDate = (createAt: Timestamp | Date | string | number) => {
        if ((createAt instanceof Timestamp)) {
            return createAt.toDate().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\. /g, '.');
        } else {
            const date = new Date(createAt);

            const format = date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
            return format;
        }
    }

    const addComment = async (parentId: string | null = null, commentId: string) => {
        if (!hasLogin) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (user) {
            const text = parentId ? replyText : commentText;
            const uid = user.uid;

            if (!text.trim()) {
                alert(parentId ? '답글을 입력해주세요.' : '댓글을 입력해주세요.');
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

                const commentRef = collection(db, `posts/${post}/comments`);

                const commentData = {
                    replyId: commentId,
                    user: uid,
                    commentText: text,
                    createAt: Timestamp.now(),
                    parentId,
                }

                // firebase에 추가
                const newCommentRef = await addDoc(commentRef, commentData);
                const newCommentId = newCommentRef.id;

                // 댓글 수 수정
                const postRef = doc(db, 'posts', post)
                await updateDoc(postRef, {
                    commentCount: increment(1)
                })

                setCommentList((prev) => [
                    ...prev,
                    { ...commentData, id: newCommentId, createAt: commentData.createAt, displayName: user.name, photoURL: user.photo } as Comment
                ]);

                setCommentText('');
                setReplyText('');
                setActiveReply(null);
            } catch (error) {
                console.error('댓글 추가 중 오류:', error);
                alert('댓글 추가에 실패했습니다.');
            }
        }
    }

    const deleteComment = async (commentId: string) => {
        if (user) {
            const userId = user.uid;

            try {
                const docRef = await getDoc(doc(db, 'posts', post, 'comments', commentId));
                if (!docRef.exists()) {
                    alert('해당 댓글을 찾을 수 없습니다.');
                    return;
                }

                const commentOwnerId = docRef.data()?.user;

                if (userId === commentOwnerId || userId === ADMIN) {
                    const confirmed = confirm('댓글을 삭제 하시겠습니까?')
                    if (confirmed) {
                        // 댓글 삭제
                        await deleteDoc(doc(db, 'posts', post, 'comments', commentId));

                        // 해당 댓글에 대한 답글 삭제
                        const repliesQuery = query(
                            collection(db, 'posts', post, 'comments'),
                            where('parentId', '==', commentId)
                        );

                        const replySnapshot = await getDocs(repliesQuery);
                        const deletePromises = replySnapshot.docs.map(replyDoc => deleteDoc(replyDoc.ref));
                        await Promise.all(deletePromises); // 모든 답글 삭제를 기다림

                        setCommentList((prevComments) => prevComments.filter((comment) => comment.id !== commentId));

                        // 댓글 수 수정: 현재 댓글과 답글 수를 계산
                        const allCommentsQuery = query(collection(db, 'posts', post, 'comments'));
                        const allCommentsSnapshot = await getDocs(allCommentsQuery);
                        const totalCommentsCount = allCommentsSnapshot.size; // 현재 댓글 수

                        const postRef = doc(db, 'posts', post)
                        await updateDoc(postRef, {
                            commentCount: totalCommentsCount
                        })
                        setCommentCount(totalCommentsCount)
                        alert('댓글이 삭제 되었습니다.');
                    }
                } else {
                    alert('댓글 삭제 권한이 없습니다.');
                }
            } catch (error) {
                console.error('댓글 삭제 중 오류 발생:', error);
                alert('댓글 삭제 중 오류가 발생했습니다.');
            }
        }
    } // 댓글 삭제

    const toggleReply = (commentId: string) => {
        setActiveReply((prev) => (prev === commentId ? null : commentId))
    } // 답글 입력 인풋 토글

    const { hasUpdate, clearUpdate } = useCommentUpdateChecker();

    useEffect(() => {
        if (commentList) {
            setCommentCount(commentList.length)
            if (commentList.length > 0) {
                setLastFetchedAt(commentList[commentList.length - 1].createAt)
            }
        }
    }, [commentList])

    useEffect(() => {
        clearUpdate();
    }, [])

    // 댓글  반영
    const fetchComment = async () => {
        try {
            const commentRef = collection(db, "posts", post, "comments");
            console.log("Last fetched at:", lastFetchedAt);

            const commentQuery = lastFetchedAt
                ? query(
                    commentRef,
                    orderBy("createAt", "asc"),
                    startAfter(
                        lastFetchedAt instanceof Timestamp
                            ? lastFetchedAt
                            : new Timestamp(lastFetchedAt.seconds, lastFetchedAt.nanoseconds)
                    )
                )
                : query(commentRef, orderBy("createAt", "asc"));
            const snapshot = await getDocs(commentQuery);

            if (snapshot.empty) {
                // 새로운 댓글이 없는 경우: lastFetchedAt는 그대로 유지
                clearUpdate();
                console.error("새로운 댓글이 없습니다.");
                return;
            }

            // 댓글 데이터 생성
            const newComments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Comment[];

            // `lastFetchedAt` 업데이트
            const lastDoc = snapshot.docs[snapshot.docs.length - 1];
            console.log("Last document data:", lastDoc.data());
            console.log("Type of createAt:", typeof lastDoc?.data()?.createAt);

            if (lastDoc) {
                const lastDocData = lastDoc.data() as { createAt: Timestamp };
                setLastFetchedAt(lastDocData.createAt); // `Timestamp`로 저장

                // 상태 업데이트
                setCommentList((prev) => {
                    const uniqueComments = new Map(prev.concat(newComments).map((comment) => [comment.id, comment]));
                    return Array.from(uniqueComments.values());
                });
                // 업데이트 플래그 초기화
                clearUpdate();
            } else {
                clearUpdate();
                console.error("댓글을 가져오는 중 오류 발생: lastDoc undefinded. 최신 댓글이 없습니다.");
            }
        } catch (error) {
            console.error("댓글을 가져오는 중 오류 발생:", error);
        }
    };

    // 버튼 클릭 시 새 데이터 로드
    const handleUpdateClick = () => {
        fetchComment();
    };
    // function

    return (
        <MemoBox btnStatus>
            {hasUpdate &&
                <button css={
                    css`
                    padding: 8px;
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1;
                    background: #0087ff;
                    color: #fff;
                    border: none;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    `}
                    onClick={handleUpdateClick}>새로운 업데이트 확인
                </button>
            }
            <div className="memo_btn_wrap">
                <div className="comment_wrap">댓글 {commentCount}</div>
            </div>
            <div className="status_wrap">
                <PostCommentStyle>
                    {commentCount > 0 ?
                        // parentId가 없는 댓글(최상위 댓글)만 필터링
                        <>
                            {commentList.filter(comment => !comment.parentId).map(comment => (
                                <div key={comment.id} className="memo_comment_wrap">
                                    <div className="user_profile">
                                        <div className="user_photo"
                                            css={css`
                                                background-image : url(${comment.photoURL})
                                                `}
                                        ></div>
                                        <p className="memo_comment_id">{comment.displayName}</p>
                                        <button className="comment_delete_btn" onClick={() => deleteComment(comment.id)}></button>
                                    </div>
                                    <p className="memo_comment">{comment.commentText}</p>
                                    <p className="memo_comment_date">{formatDate(comment.createAt)}</p>
                                    <button className="comment_reply_btn" onClick={() => toggleReply(comment.id)}>답글</button>
                                    {activeReply === comment.id && (
                                        <div className="reply_input_wrap">
                                            <textarea
                                                className="comment_input"
                                                placeholder="답글 입력"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <button
                                                className="comment_upload_btn"
                                                onClick={() => addComment(comment.id, comment.id)}
                                            >
                                                등록
                                            </button>
                                        </div>
                                    )}

                                    {commentList
                                        .filter(reply => reply.parentId === comment.id) // 현재 댓글의 답글 필터링
                                        .map(reply => (
                                            <div className="reply_wrap" key={reply.id}>
                                                <div className="user_profile">
                                                    <div className="user_photo"
                                                        css={css`
                                                            background-image : url(${reply.photoURL})
                                                            `}
                                                    ></div>
                                                    <p className="memo_comment_id">{reply.displayName}</p>
                                                    <button className="comment_delete_btn" onClick={() => deleteComment(reply.id)}></button>
                                                </div>
                                                <span className="memo_reply_id">@{reply.displayName}</span>
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
                                                            onClick={() => addComment(reply.parentId, reply.id)}
                                                        >
                                                            등록
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        ))}
                                </div>
                            ))}
                        </>
                        :
                        <div>
                            <p>안녕하세요 댓글이 엄서요 첫 댓글을 달아보세용</p>
                        </div>
                    }
                    < div className="post_bottom">
                        <div className="post_menu_wrap">
                            <BookmarkBtn postId={post} />
                        </div>
                        <PostCommentInputStyle>
                            <div className="login_user_profile">
                                <div className="login_user_photo"
                                    css={css`
                                        background-image : url(${user?.photo})
                                        `}
                                ></div>
                                <p className="login_user_id">{user?.name}</p>
                            </div>
                            <textarea className="comment_input" placeholder="댓글 입력" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                            <button className="comment_upload_btn" onClick={() => addComment(null, 'comment')}>등록</button>
                        </PostCommentInputStyle>
                    </div>
                </PostCommentStyle>
            </div>
        </MemoBox >
    )
}