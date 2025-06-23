/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { adminState, ImagePostData, loadingState, PostData, UsageLimitState, UsageLimitToggle, userData, userState } from "@/app/state/PostState";
import { css } from "@emotion/react";
import { motion } from "framer-motion";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { startTransition, useEffect, useRef, useState } from "react";
import { UserPostWrap } from "./userStyle";
import { db } from "@/app/DB/firebaseConfig";
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useRouter } from "next/navigation";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { NoMorePost } from "@/app/styled/PostComponents";
import { fetchImageList, fetchPostList } from "@/app/utils/fetchPostData";
import LoadingWrap from "@/app/components/LoadingWrap";
import { btnVariants } from "@/app/styled/motionVariant";
import { formatDate } from "@/app/utils/formatDate";
import useOutsideClick from "@/app/hook/OutsideClickHook";
import { cleanHtml } from "@/app/utils/CleanHtml";
import LoadLoading from "@/app/components/LoadLoading";

interface ClientUserProps {
    user: userData,
}

interface FetchPostListResponse {
    data: PostData[];
    nextPage: Timestamp | undefined;
}
interface FetchImageListResponse {
    data: ImagePostData[];
    nextPage: Timestamp | undefined;
}

export default function UserClient({ user }: ClientUserProps) {
    const isAdmin = useRecoilValue(adminState);
    const router = useRouter();
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const [postTab, setPostTab] = useState<boolean>(true)
    const [dropToggle, setDropToggle] = useState<string>('')
    const [loading, setLoading] = useRecoilState(loadingState);
    const currentUser = useRecoilValue(userState)
    const [routePostId, setRoutePostId] = useState<string | null>(null);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

    const dropdownRef = useRef<HTMLDivElement>(null);
    const observerLoadRef = useRef(null);
    const observerImageLoadRef = useRef(null);

    const uid = user.uid

    // 무한 스크롤 로직
    const {
        data: userPosts,
        fetchNextPage,
        hasNextPage,
        isLoading: postLoading,
        isError: postError,
    } = useInfiniteQuery<
        FetchPostListResponse,
        Error,
        InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>,
        string[], // TQueryKey
        Timestamp | undefined // TPageParam
    >({
        retry: false,
        queryKey: ['postList', uid as string],
        queryFn: async ({ pageParam }) => {
            try {
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ uid }),
                });
                if (!validateResponse.ok) {
                    const errorDetails = await validateResponse.json();
                    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
                }

                return fetchPostList(uid as string, pageParam);
            } catch (error) {
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    throw error;
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
        initialPageParam: undefined,
    });

    // 무한 스크롤 로직
    const {
        data: ImagePosts,
        fetchNextPage: fetchNextImgPage,
        hasNextPage: hasImagePage,
        isLoading: imageLoading,
        isError: imageError,
    } = useInfiniteQuery<
        FetchImageListResponse,
        Error,
        InfiniteData<{ data: ImagePostData[]; nextPage: Timestamp | undefined }>,
        string[], // TQueryKey
        Timestamp | undefined // TPageParam
    >({
        retry: false,
        enabled: !postTab,
        queryKey: ['ImagePostList', uid as string],
        queryFn: async ({ pageParam }) => {
            try {
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ uid }),
                });
                if (!validateResponse.ok) {
                    const errorDetails = await validateResponse.json();
                    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
                }

                return fetchImageList(uid as string, pageParam);
            } catch (error) {
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    throw error;
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
        initialPageParam: undefined,
    });

    const userPostList = userPosts?.pages.flatMap(page => page.data) || [];
    const userImageList = ImagePosts?.pages.flatMap(page => page.data) || [];

    // 스크롤 끝나면 포스트 요청
    const isFirstLoad = useRef(true); // 최초 실행 여부 확인

    useEffect(() => {
        if (usageLimit || !postTab) return; // postTab === false면 실행 안 함.

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    if (isFirstLoad.current) {
                        isFirstLoad.current = false; // 최초 실행을 방지하고 이후부터 동작
                        return;
                    }
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
                if (entries[0].isIntersecting && hasNextPage) {
                    if (entries[0].isIntersecting && hasNextPage) {
                        if (isFirstLoad.current) {
                            isFirstLoad.current = false; // 최초 실행을 방지하고 이후부터 동작
                            return;
                        }
                        fetchNextPage();
                    }
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
    }, [hasImagePage, fetchNextImgPage, usageLimit, postTab]);

    // 초기 데이터 로딩
    useEffect(() => {
        setLoading(false); // 초기 로딩 해제
    }, [])

    // 포스트 삭제
    const deletePost = async (postId: string) => {
        try {
            // 게시글 존재 확인
            const postDoc = await getDoc(doc(db, 'posts', postId));
            if (!postDoc.exists()) {
                alert('해당 게시글을 찾을 수 없습니다.')
                return;
            }

            const postOwnerId = postDoc.data()?.userId;

            // 삭제 권한 확인
            if (currentUser.uid === postOwnerId || isAdmin) {
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

    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        if (usageLimit) {
            return setLimitToggle(true);
        }
        setRoutePostId(postId);
        setTimeout(() => {
            startTransition(() => {
                router.push(`/home/memo/${postId}`)
            });
        }, 0);
    }

    // 외부 클릭 시 드롭다운 닫기
    useOutsideClick(dropdownRef, () => {
        if (dropToggle) {
            setDropToggle('');
        }
    });

    return (
        <>
            <UserPostWrap>
                <div className="user_tab_wrap">
                    <motion.button
                        variants={btnVariants}
                        whileHover={{
                            borderBottom: '1px solid #191919',
                            cursor: 'pointer',
                        }} className="memo_tab" onClick={() => setPostTab(true)}>메모</motion.button>
                    <motion.button
                        variants={btnVariants}
                        whileHover={{
                            borderBottom: '1px solid #191919',
                            cursor: 'pointer',
                        }} className="image_tab" onClick={() => setPostTab(false)}>이미지</motion.button>
                </div >
                {
                    postTab ?
                        <>
                            {
                                !loading && userPostList.map((post) => (
                                    <motion.div key={post.id} className="user_post_list_wrap"
                                        whileHover={{
                                            backgroundColor: "#fafbfc",
                                            transition: { duration: 0.1 },
                                        }}
                                        onClick={() => handlePostClick(post.id)}
                                    >
                                        {routePostId === post.id && <LoadLoading />}
                                        <div className="user_post_profile_wrap">
                                            <div className="user_post_top">
                                                <div className="user_post_photo"
                                                    css={css`background-image : url(${user.photo})`}
                                                ></div>
                                                <div className="user_post_name">
                                                    <p>{user.name}</p>
                                                    <span>@{user.uid?.slice(0, 6)}... · {formatDate(post.createAt)}</span>
                                                </div>
                                                <div className="post_more">
                                                    <motion.button
                                                        variants={btnVariants}
                                                        whileHover="iconWrapHover"
                                                        whileTap="iconWrapClick"
                                                        className='post_drop_menu_btn'
                                                        css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736451404/%EB%B2%84%ED%8A%BC%EB%8D%94%EB%B3%B4%EA%B8%B0_obrxte.svg)`}
                                                        onClick={(event) => { event.preventDefault(); event.stopPropagation(); setDropToggle((prev) => (prev === post.id ? '' : post.id)); }}
                                                    >
                                                        {dropToggle === post.id &&
                                                            <div ref={dropdownRef}>
                                                                <ul>
                                                                    <li className='post_drop_menu'>
                                                                        <button onClick={(event) => { event.preventDefault(); deletePost(post.id); }} className='post_dlt_btn'>게시글 삭제</button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        }
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="user_post_content_wrap">
                                            <div className="user_post_title_wrap">
                                                {post.notice ?
                                                    <>
                                                        <span className='user_notice_tag'>{post.tag}</span>
                                                        <p className="user_notice_title">{post.title}</p>
                                                    </>
                                                    :
                                                    <>
                                                        <span className='user_post_tag'>[{post.tag}]</span>
                                                        <p className="user_post_title">{post.title}</p>
                                                    </>
                                                }
                                            </div>
                                            <div className="user_post_content" dangerouslySetInnerHTML={{ __html: cleanHtml(post.content) }}></div>
                                            {(post.images && post.images.length > 0) && (
                                                <>
                                                    <div className="user_post_img">
                                                        <div css={css`
                                                        background-image : url(${post.images[0]})
                                                    `}>
                                                            {post.images.length > 1 &&
                                                                <div className='post_pr_more' css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746002760/%EC%9D%B4%EB%AF%B8%EC%A7%80%EB%8D%94%EC%9E%88%EC%9D%8C_gdridk.svg)`}></div>
                                                            }
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            <div className="user_post_bottom">
                                                <div className="user_post_comment">
                                                    <motion.button
                                                        variants={btnVariants}
                                                        whileHover="iconWrapHover"
                                                        whileTap="iconWrapClick" className='post_comment_btn'>
                                                        <motion.div
                                                            variants={btnVariants}
                                                            whileHover="iconHover"
                                                            whileTap="iconClick" className='post_comment_icon'>
                                                        </motion.div>
                                                    </motion.button>
                                                    <p>
                                                        {post.commentCount}
                                                    </p>
                                                </div>
                                                <BookmarkBtn postId={post.id}></BookmarkBtn>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            }
                            {postTab && <div className="postObserver" ref={observerLoadRef} css={css`height: 1px; visibility: ${postLoading ? "hidden" : "visible"};`} />}
                            {(!loading && postLoading) && <LoadingWrap />}
                            {postError &&
                                <NoMorePost>
                                    <span>포스트 로드 중 문제가 발생했습니다.</span>
                                    <motion.button className='retry_post_btn'
                                        variants={btnVariants}
                                        whileHover="loginHover"
                                        whileTap="loginClick">재요청</motion.button>
                                </NoMorePost>
                            }
                            {
                                (!hasNextPage && !loading && !postLoading) &&
                                <>
                                    {
                                        (userPostList.length === 0 && !loading) ?
                                            < NoMorePost >
                                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966543/%EB%A9%94%EB%AA%A8%EC%97%86%EC%96%B4_d0sm6q.svg)`}></div>
                                                <p>메모가 없습니다.</p>
                                                <span>새 메모를 작성 해보세요.</span>
                                            </NoMorePost>
                                            :
                                            <NoMorePost>
                                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966548/%EB%A9%94%EC%9D%B8%EB%8B%A4%EB%B4%A4%EC%9D%8C_fahwir.svg)`}></div>
                                                <p>모두 확인했습니다.</p>
                                                <span>전체 메모를 전부 확인했습니다.</span>
                                            </NoMorePost>

                                    }
                                </>
                            }
                        </>
                        :
                        <>
                            <div className="user_image_post_wrap">
                                {!loading && userImageList.map((post) => (
                                    post.images &&
                                    <div key={post.id} className="user_image_wrap">
                                        {post.images.length > 0 && (
                                            <>
                                                {routePostId === post.id && <LoadLoading />}
                                                <div className="image_post_img" css={css`
                                                            background-image : url(${post.images[0]})
                                                        `} onClick={() => handlePostClick(post.id)}>
                                                </div>
                                                {post.images.length > 1 &&
                                                    <div className="image_list_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746002760/%EC%9D%B4%EB%AF%B8%EC%A7%80%EB%8D%94%EC%9E%88%EC%9D%8C_gdridk.svg)`}></div>
                                                }
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {!postTab && <div className="imageObserver" ref={observerImageLoadRef} css={css`height: 1px; visibility: ${imageLoading ? "hidden" : "visible"};`} />}
                            {(!loading && imageLoading) && <LoadingWrap />}
                            {imageError &&
                                <NoMorePost>
                                    <span>포스트 로드 중 문제가 발생했습니다.</span>
                                    <motion.button className='retry_post_btn'
                                        variants={btnVariants}
                                        whileHover="loginHover"
                                        whileTap="loginClick">재요청</motion.button>
                                </NoMorePost>
                            }
                            {
                                (!hasNextPage && !loading && !imageLoading) &&
                                <>
                                    {
                                        (userImageList.length === 0 && !loading) ?
                                            <NoMorePost>
                                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966543/%EB%A9%94%EB%AA%A8%EC%97%86%EC%96%B4_d0sm6q.svg)`}></div>
                                                <p>메모가 없습니다.</p>
                                                <span>이미지가 포함된 메모가 없습니다.</span>
                                            </NoMorePost>
                                            :
                                            <NoMorePost>
                                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966548/%EB%A9%94%EC%9D%B8%EB%8B%A4%EB%B4%A4%EC%9D%8C_fahwir.svg)`}></div>
                                                <p>모두 확인했습니다.</p>
                                                <span>이미지가 포함된 메모를 전부 확인했습니다.</span>
                                            </NoMorePost>
                                    }
                                </>
                            }
                        </>
                }
            </UserPostWrap >
        </>
    )
}
