/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { auth, db } from "@/app/DB/firebaseConfig";
import { ADMIN_ID, Comment, DidYouLogin, memoCommentState, memoList, memoState, PostData, postStyleState, userState } from "@/app/state/PostState";
import styled from "@emotion/styled";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import BookmarkBtn from "../BookmarkBtn";
import { PostCommentInputStyle, PostCommentStyle } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";

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
background : red;
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

.memo_btn_wrap button{
width : 50%;
background : #fff;
font-size : 14px;
line-height : 38px;
cursor : pointer;
}

.comment_btn{
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
background : red;
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
}
`
export default function MemoStatus({ post }: ClientPostProps) {
    const router = useRouter();
    const memo = useRecoilValue<memoList>(memoState)
    const [commentList, setCommentList] = useRecoilState<Comment[]>(memoCommentState)
    const postStyle = useRecoilValue<boolean>(postStyleState)
    const [btnStatus, setBtnStatus] = useState<boolean>(true)
    const [commentText, setCommentText] = useState<string>('')
    const [replyText, setReplyText] = useState<string>('')
    const [activeReply, setActiveReply] = useState<string | null>(null); // 활성화된 답글 ID
    const user = useRecoilValue(userState)
    const hasLogin = useRecoilValue(DidYouLogin)
    const ADMIN = useRecoilValue(ADMIN_ID)
    // state

    const formatDate = (createAt: any) => {
        if (createAt?.toDate) {
            return createAt.toDate().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\. /g, '.');
        } else if (createAt?.seconds) {
            return new Date(createAt.seconds * 1000).toLocaleDateString('ko-KR', {
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
            })

            return format;
        }
    }

    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        router.push(`memo/${postId}`)
    }

    const addComment = async (parentId: string | null = null, commentId: string) => {
        if (!hasLogin) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (user) {
            const userId = user.uid;
            const text = parentId ? replyText : commentText;
            const commentRef = collection(db, 'posts', post, 'comments');

            if (!text.trim()) {
                alert(parentId ? '답글을 입력해주세요.' : '댓글을 입력해주세요.');
                return;
            }

            try {
                const localTimestamp = new Date(); // 로컬 타임스탬프 생성

                const commentData = {
                    replyId: commentId,
                    user: userId,
                    commentText: text,
                    createAt: serverTimestamp(),
                    localTimestamp,
                    parentId,
                }

                // firebase에 추가
                await addDoc(commentRef, commentData);

                // 댓글 수 수정
                const postRef = doc(db, 'posts', post)
                await updateDoc(postRef, {
                    commentCount: increment(1)
                })

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
        if (!auth.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

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

    // function

    // 댓글 실시간 반영
    // useEffect(() => {
    //     const userCache = new Map<string, { nickname: string; photo: string | null }>();

    //     if (!post) return;

    //     const commentRef = collection(db, 'posts', post, 'comments');
    //     const Q = query(commentRef, orderBy('createAt', 'asc'));

    //     const unsubscribe = onSnapshot(Q, async (snapshot) => {
    //         const comments = await Promise.all(snapshot.docs.map(async (docs: any) => {
    //             const commentData = {
    //                 id: docs.id,
    //                 ...docs.data(),
    //             } as Comment;

    //             // 사용자 정보 캐시 처리
    //             if (!userCache.has(commentData.user)) { // userId를 user로 변경
    //                 const userDocRef = doc(db, "users", commentData.user); // DocumentReference 생성
    //                 const userDoc = await getDoc(userDocRef); // 문서 데이터 가져오기

    //                 if (userDoc.exists()) {
    //                     const userData = userDoc.data() as { displayName: string; photoURL: string | null };
    //                     userCache.set(commentData.user, {
    //                         nickname: userData.displayName,
    //                         photo: userData.photoURL || null,
    //                     });
    //                 } else {
    //                     userCache.set(commentData.user, {
    //                         nickname: "Unknown",
    //                         photo: null,
    //                     });
    //                 }
    //             }

    //             // 캐시에서 사용자 정보 가져오기
    //             const userData = userCache.get(commentData.user) || { nickname: 'Unknown', photo: null };
    //             commentData.displayName = userData.nickname;
    //             commentData.PhotoURL = userData.photo;

    //             return commentData;
    //         }));
    //         setCommentList(comments);
    //     });

    //     return () => unsubscribe();
    // }, [post])


    return (
        <MemoBox btnStatus={btnStatus}>
            <div className="memo_btn_wrap">
                <button className="comment_btn" onClick={() => setBtnStatus(true)}>댓글 {commentList.length}</button>
                <button className="memo_btn" onClick={() => setBtnStatus(false)}>작성자 메모 {memo.list.length}</button>
            </div>
            <div className="status_wrap">
                {btnStatus ?
                    <PostCommentStyle>
                        {commentList.length > 0 ?
                            // parentId가 없는 댓글(최상위 댓글)만 필터링
                            <>
                                {commentList.filter(comment => !comment.parentId).map(comment => (
                                    <div key={comment.id} className="memo_comment_wrap">
                                        <div className="user_profile">
                                            <div className="user_photo"
                                                css={css`
                                                background-image : url(${comment.PhotoURL})
                                                `}
                                            ></div>
                                            <p className="memo_comment_id">{comment.displayName}</p>
                                            <button className="comment_delete_btn" onClick={() => deleteComment(comment.id)}></button>
                                        </div>
                                        <p className="memo_comment">{comment.commentText}</p>
                                        <p className="memo_comment_date">{formatDate(comment.localTimestamp)}</p>
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
                                                            background-image : url(${reply.PhotoURL})
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
                    :
                    memo.list.map((memos) => (
                        <div key={memos.id} className="status_post_list">
                            <div className="memo_title_wrap">
                                {(memos.images && memos.images.length > 0) ?
                                    <div className="memo_img_tag"></div>
                                    :
                                    <div className="memo_img_void"></div>
                                }
                                <span className="memo_tag">[{memos.tag}]</span>
                                <p className="memo_title" onClick={() => handlePostClick(memos.id)}>{memos.title}</p>
                            </div>
                            <div className="memo_date">
                                <span>{formatDate(memos.createAt)}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </MemoBox >
    )
}