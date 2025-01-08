/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchPosts, fetchPostsWithImages } from "@/app/api/loadToFirebasePostData/fetchPostData";
import { ADMIN_ID, PostData, UsageLimitState, userData } from "@/app/state/PostState";
import { css } from "@emotion/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UserPostWrap } from "./userStyle";
import { auth, db } from "@/app/DB/firebaseConfig";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";

interface ClientUserProps {
    user: userData,
    post: PostData[],
    initialNextPage: any;
    imagePost: PostData[],
    initialImageNextPage: any;
}

export default function UserClient({ user, post: initialPosts, initialNextPage, imagePost: initialImagePosts, initialImageNextPage }: ClientUserProps) {
    const [imagePost, setImagePost] = useState<PostData[]>([])
    const ADMIN = useRecoilValue(ADMIN_ID);
    const router = useRouter();
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [posts, setPosts] = useState<PostData[]>([])
    const [postTab, setPostTab] = useState<boolean>(true)

    const observerLoadRef = useRef(null);
    const observerImageLoadRef = useRef(null);

    // 무한 스크롤 로직
    const {
        data,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['postlist'],
        queryFn: async ({ pageParam }) => {
            try {
                console.log(pageParam.at(1), '보내는 시간')
                return fetchPosts(user.uid, pageParam, 4);
            } catch (error: any) {
                if (error.message) {
                    setUsageLimit(true); // 에러 상태 업데이트
                    throw error; // 에러를 다시 던져서 useInfiniteQuery가 에러 상태를 인식하게 함
                }
            }
        },
        getNextPageParam: (lastPage) => {
            // 사용량 초과 시 페이지 요청 중단
            if (usageLimit || !lastPage.nextPage) {
                return;
            }
            return lastPage.nextPage;
        },
        staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
        initialPageParam: {
            initialNextPage
        }, // 초기 페이지 파라미터 설정
        initialData: {
            pages: [{ data: initialPosts, nextPage: initialNextPage }],
            pageParams: [initialNextPage],
        },
    });

    const {
        data: imageData,
        fetchNextPage: fetchNextImagePage,
        hasNextPage: hasNextImagePage,
    } = useInfiniteQuery({
        queryKey: ['imagePostlist'],
        queryFn: async ({ pageParam }) => {
            try {
                console.log(pageParam.at(1), '이미지 요청 시간');
                return fetchPostsWithImages(user.uid, pageParam, 4);
            } catch (error: any) {
                if (error.message) {
                    setUsageLimit(true); // 에러 상태 업데이트
                    throw error;
                }
            }
        },
        getNextPageParam: (lastPage) => {
            if (usageLimit || !lastPage.nextPage) {
                return;
            }
            return lastPage.nextPage;
        },
        staleTime: 5 * 60 * 1000,
        initialPageParam: {
            initialImageNextPage
        }, // 초기 페이지 파라미터 설정
        initialData: {
            pages: [{ data: initialImagePosts, nextPage: initialImageNextPage }],
            pageParams: [initialImageNextPage],
        },
    });

    // 무한 스크롤 로직의 data가 변할때 마다 posts 배열 업데이트
    useEffect(() => {
        const uniquePosts = Array.from(
            new Map(
                [
                    ...data.pages.flatMap((page) => page.data as PostData[]) // 무한 스크롤 데이터
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );
        setPosts(uniquePosts); // 중복 제거된 포스트 배열을 posts에 저장
    }, [data.pages]);

    useEffect(() => {
        const uniqueImagePosts = Array.from(
            new Map(
                [
                    ...imageData.pages.flatMap((page) => page.data as PostData[])
                ].map((post) => [post.id, post])
            ).values()
        );
        console.log(uniqueImagePosts)
        setImagePost(uniqueImagePosts);
    }, [imageData.pages]);

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (usageLimit || !postTab) return; // postTab === false면 실행 안 함.

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerLoadRef.current) {
            observer.observe(observerLoadRef.current);
        }



        return () => {
            if (observerLoadRef.current) {
                observer.unobserve(observerLoadRef.current); // 기존 observer 해제
            }
            observer.disconnect(); // 강제 해제
        };
    }, [hasNextPage, fetchNextPage, usageLimit, postTab])

    useEffect(() => {
        if (usageLimit || postTab) return; // postTab === true면 실행 안 함.

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextImagePage) {
                    fetchNextImagePage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerImageLoadRef.current) {
            observer.observe(observerImageLoadRef.current);
        }


        return () => {
            if (observerImageLoadRef.current) {
                observer.unobserve(observerImageLoadRef.current); // 기존 observer 해제
            }
            observer.disconnect(); // 강제 해제
        };
    }, [hasNextImagePage, fetchNextImagePage, usageLimit, postTab]);

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
                    <button className="memo_tab" onClick={() => setPostTab(true)}>메모 {posts.length}</button>
                    <button className="image_tab" onClick={() => setPostTab(false)}>이미지</button>
                </div>
                {postTab ?
                    <>
                        {posts.map((post) => (
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
                                {(post.images && post.images.length > 0) && (
                                    <div className="user_post_img">
                                        {post.images.map((imageUrl, index) => (
                                            <div key={index} css={css`
                                        background-image : url(${imageUrl})
                                        `}></div>
                                        ))}
                                    </div>
                                )}
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
                        {postTab && < div className="postObserver" ref={observerLoadRef} style={{ height: '1px' }} />}
                        {!hasNextPage && <p>제일 최근 메모입니다.</p>}
                    </>
                    :
                    <>
                        <div className="user_image_post_wrap">
                            {imagePost.map((post) => (
                                post.images &&
                                <div key={post.id} className="user_image_wrap">
                                    {post.images.length > 0 && (
                                        <>
                                            {post.images.map((imageUrl, index) => (
                                                <div key={index} className="image_post_img" css={css`
                                            background-image : url(${imageUrl})
                                            `}>
                                                </div>
                                            ))}
                                            < div className="image_list_icon"></div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!postTab && < div className="imageObserver" ref={observerImageLoadRef} style={{ height: '1px' }} />}
                        {!hasNextPage && <p>제일 최근 메모입니다.</p>}
                    </>
                }

            </UserPostWrap >
        </>
    )
}
