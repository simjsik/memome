/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchPostList } from "@/app/api/loadToFirebasePostData/fetchPostData";
import { ADMIN_ID, PostData, userData } from "@/app/state/PostState";
import { css } from "@emotion/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { UserPostWrap } from "./userStyle";
import { auth, db } from "@/app/DB/firebaseConfig";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";

interface ClientUserProps {
    user: userData
}


export default function UserClient({ user }: ClientUserProps) {
    const [userPost, setUserPost] = useState<PostData[]>([])
    const ADMIN = useRecoilValue(ADMIN_ID);
    const router = useRouter();
    const { data: postlist = [] } = useQuery({
        queryKey: ['postlist', user.uid],
        queryFn: () => fetchPostList(user.uid),
        staleTime: 5 * 60 * 1000,
    }); // 포스트 데이터


    useEffect(() => {
        if (postlist.length > 0 && (userPost !== postlist)) {
            setUserPost(postlist)
        }
    }, [postlist])

    const formatDate = (createAt: any) => {
        if (createAt?.toDate) {
            return createAt.toDate().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).replace(/\. /g, '.');
        } else if (createAt?.seconds) {
            return new Date(createAt.seconds * 1000).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
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

    // 포스트 삭제
    const deletePost = async (postId: string) => {
        if (!auth.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        const currentUserId = auth.currentUser.uid;

        try {
            // 게시글 존재 확인
            const postDoc = await getDoc(doc(db, 'posts', postId));
            if (!postDoc.exists()) {
                alert('해당 게시글을 찾을 수 없습니다.')
                return;
            }

            const postOwnerId = postDoc.data()?.userId;

            // 삭제 권한 확인
            if (currentUserId === postOwnerId || currentUserId === ADMIN) {
                const confirmed = confirm('게시글을 삭제 하시겠습니까?')
                if (!confirmed) return;

                await deleteDoc(doc(db, 'posts', postId));
                alert('게시글이 삭제 되었습니다.');
            } else {
                alert('게시글 삭제 권한이 없습니다.');
            }
        } catch (error) {
            console.error('게시글 삭제 중 오류가 발생했습니다.' + error)
            alert('게시글 삭제 중 오류가 발생했습니다.')
        }
    }

    const handleClickPost = (userId: string) => {
        router.push(`/home/memo/${userId}`)
    }
    return (
        <>
            <UserPostWrap>
                <div className="user_tab_wrap">
                    <button className="memo_tab">메모 {postlist.length}</button>
                    <button className="image_tab">이미지 {postlist.length}</button>
                </div>
                {postlist.map((post) => (
                    <div key={post.id} className="user_post_list_wrap">
                        <div className="user_post_top">
                            <div className="user_post_photo"
                                css={css`background-image : url(${user.photo})`}
                            ></div>
                            <div className="user_post_name">
                                <p>{user.name}</p>
                                <span>@{user.uid.slice(0, 8)}... · {formatDate(post.createAt)}</span>
                            </div>
                            <div className="post_more">
                                <button className="post_more_btn"></button>
                                <div className="post_more_list">
                                    <button className="post_delete_btn" onClick={() => deletePost(post.id)}>게시글 삭제</button>
                                </div>
                            </div>
                        </div>
                        <div className="user_post_title_wrap">
                            <span className="user_post_tag">[{post.tag}]</span>
                            <p className="user_post_title" onClick={() => handleClickPost(post.id)}>{post.title}</p>
                        </div>
                        <div className="user_post_content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                        {post.images.length > 0 &&
                            <div className="user_post_img">
                                {post.images.map((image: string[], index: number) => (
                                    <div key={index} css={css`
                                        background-image : url(${image})
                                        `}></div>
                                ))}
                            </div>
                        }

                        <div className="user_post_bottom">
                            <div className="user_post_comment">
                                <div className="user_post_comment_icon"></div>
                                <p>
                                    {post.commentCount}
                                </p>
                            </div>
                            <button className="user_post_bookmark"></button>
                        </div>
                    </div>
                ))}
            </UserPostWrap>
        </>
    )
}
