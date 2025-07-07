/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { adminState, ImagePostData, loadingState, PostData, UsageLimitState, UsageLimitToggle, userData, userState } from "@/app/state/PostState";
import { css, useTheme } from "@emotion/react";
import { motion } from "framer-motion";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { startTransition, useEffect, useRef, useState } from "react";
import { UserPostWrap } from "./userStyle";
import { db } from "@/app/DB/firebaseConfig";
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useRouter } from "next/navigation";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { NoMorePost, PostWrap } from "@/app/styled/PostComponents";
import { fetchImageList, fetchPostList } from "@/app/utils/fetchPostData";
import LoadingWrap from "@/app/components/LoadingWrap";
import { btnVariants } from "@/app/styled/motionVariant";
import { formatDate } from "@/app/utils/formatDate";
import useOutsideClick from "@/app/hook/OutsideClickHook";
import { cleanHtml } from "@/app/utils/CleanHtml";
import LoadLoading from "@/app/components/LoadLoading";
import Image from "next/image";

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
    const theme = useTheme();
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
                const userId = currentUser.uid
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ userId }),
                });
                if (!validateResponse.ok) {
                    const errorDetails = await validateResponse.json();
                    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
                }

                return fetchPostList(userId as string, uid as string, pageParam);
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
                const userId = currentUser.uid
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ userId }),
                });
                if (!validateResponse.ok) {
                    const errorDetails = await validateResponse.json();
                    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
                }

                return fetchImageList(userId as string, uid as string, pageParam);
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
                        variants={btnVariants(theme)}
                        whileHover="otherHover"
                        className="memo_tab" onClick={() => setPostTab(true)}>메모</motion.button>
                    <motion.button
                        variants={btnVariants(theme)}
                        whileHover="otherHover" className="image_tab" onClick={() => setPostTab(false)}>이미지</motion.button>
                </div >
                {
                    postTab ?
                        <>
                            <PostWrap $userPage={true}>
                                {!loading && userPostList.length > 0 && userPostList.map((post) => (
                                    <motion.div
                                        key={post?.id}
                                        className='post_box'
                                        onClick={(event) => { event.preventDefault(); handlePostClick(post?.id as string); }}
                                        whileHover='otherHover'
                                        variants={btnVariants(theme)}
                                    >
                                        {routePostId === post?.id && <LoadLoading />}
                                        {/* 작성자 프로필 */}
                                        <div className='post_profile_wrap'>
                                            <div className='user_profile'>
                                                <div className='user_photo'
                                                    css={css`background-image : url(${post?.photoURL})`}
                                                >
                                                </div>
                                                <p className='user_name'>
                                                    {post?.displayName}
                                                </p>
                                                <span className='user_uid'>
                                                    @{post?.userId.slice(0, 6)}...
                                                </span>
                                                <p className='post_date'>
                                                    · {formatDate(post?.createAt as Timestamp)}
                                                </p>
                                            </div>
                                            {user.uid === currentUser.uid &&
                                                <div className='post_dropdown_wrap' ref={dropdownRef}>
                                                    <motion.button
                                                        variants={btnVariants(theme)}
                                                        whileHover="iconWrapHover"
                                                        whileTap="iconWrapClick"
                                                        className='post_drop_menu_btn'
                                                        aria-label='포스트 옵션 더보기'
                                                        css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736451404/%EB%B2%84%ED%8A%BC%EB%8D%94%EB%B3%B4%EA%B8%B0_obrxte.svg)`}
                                                        onClick={(event) => { event.preventDefault(); event.stopPropagation(); setDropToggle((prev) => (prev === post.id ? '' : post.id)); }}
                                                    >
                                                        {dropToggle === post.id &&
                                                            <div>
                                                                <ul>
                                                                    <li className='post_drop_menu'>
                                                                        <motion.button
                                                                            variants={btnVariants(theme)}
                                                                            whileHover="otherHover"
                                                                            onClick={(event) => { event.preventDefault(); event.stopPropagation(); deletePost(post.id); }} className='post_dlt_btn'>게시글 삭제</motion.button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        }
                                                    </motion.button>
                                                </div>
                                            }
                                        </div>
                                        {/* 포스트 내용 */}
                                        < div className='post_content_wrap' >
                                            {/* 포스트 제목 */}
                                            < div className='post_title_wrap' >
                                                {post?.notice ?
                                                    <>
                                                        <span className='notice_tag'>{post?.tag}</span>
                                                        <h2 className='notice_title'>{post?.title}</h2>
                                                    </>
                                                    :
                                                    <>
                                                        <span className='post_tag'>[{post?.tag}]</span>
                                                        <h2 className='post_title'>{post?.title}</h2>
                                                    </>
                                                }
                                            </div>
                                            <div className='post_text' dangerouslySetInnerHTML={{ __html: cleanHtml(post?.content as string) }}></div>
                                            {/* 이미지 */}
                                            {(post?.images && post.images.length > 0) && (
                                                <div className='post_pr_img_wrap'>
                                                    <div className='post_pr_img'>
                                                        <Image
                                                            src={post.images[0]}
                                                            alt="포스트 이미지"
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                        {post.images.length > 1 &&
                                                            <div className='post_pr_more' css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746002760/%EC%9D%B4%EB%AF%B8%EC%A7%80%EB%8D%94%EC%9E%88%EC%9D%8C_gdridk.svg)`}></div>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            {/* 포스트 댓글, 북마크 등 */}
                                            <div className='post_bottom_wrap'>
                                                <div className='post_comment'>
                                                    <motion.button
                                                        variants={btnVariants(theme)}
                                                        whileHover="iconWrapHover"
                                                        whileTap="iconWrapClick" className='post_comment_btn'>
                                                        <motion.div
                                                            variants={btnVariants(theme)}
                                                            whileHover="iconHover"
                                                            whileTap="iconClick" className='post_comment_icon'>
                                                            <svg viewBox="0 0 67.41 67.41">
                                                                <g>
                                                                    <path fill='none' css={css`stroke : ${theme.colors.text}; stroke-width: 5`} d="M48.23,6.7h-29C12.29,6.7,6.7,11.59,6.7,17.62V40.77c0,6,2.61,10.91,9.5,10.91h.91a1.84,1.84,0,0,1,1.95,1.71v5.26c0,1.55,1.88,2.54,3.45,1.81l13.72-8.32a4.9,4.9,0,0,1,2.08-.46h9.92c6.89,0,12.47-4.88,12.47-10.91V17.62C60.7,11.59,55.12,6.7,48.23,6.7Z" />
                                                                    <rect width="67.41" height="67.41" fill='none' />
                                                                </g>
                                                            </svg>
                                                        </motion.div>
                                                    </motion.button>
                                                    <p>{post?.commentCount}</p>
                                                </div>
                                                <BookmarkBtn postId={post?.id as string}></BookmarkBtn>
                                            </div>
                                        </div>
                                    </motion.div >
                                ))
                                }
                            </PostWrap>
                            {postTab && <div className="postObserver" ref={observerLoadRef} css={css`height: 1px; visibility: ${postLoading ? "hidden" : "visible"};`} />}
                            {(!loading && postLoading) && <LoadingWrap />}
                            {postError &&
                                <NoMorePost>
                                    <span>포스트 로드 중 문제가 발생했습니다.</span>
                                    <motion.button className='retry_post_btn'
                                        variants={btnVariants(theme)}
                                        whileHover="loginHover"
                                        whileTap="loginClick"
                                        onClick={() => fetchNextPage()}>재요청</motion.button>
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
                            <main className="user_image_post_wrap">
                                {!loading && userImageList.map((post) => (
                                    post.images &&
                                    <div key={post.id} className="user_image_wrap">
                                        {post.images.length > 0 && (
                                            <>
                                                {routePostId === post.id && <LoadLoading />}
                                                <div className="image_post_img" css={css`
                                                            background-image : url(${post.images[0]})
                                                        `} onClick={() => handlePostClick(post.id)}>
                                                    <Image
                                                        src={post.images[0]}
                                                        alt="포스트 이미지"
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                                {post.images.length > 1 &&
                                                    <div className="image_list_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746002760/%EC%9D%B4%EB%AF%B8%EC%A7%80%EB%8D%94%EC%9E%88%EC%9D%8C_gdridk.svg)`}></div>
                                                }
                                            </>
                                        )}
                                    </div>
                                ))}
                            </main>
                            {!postTab && <div className="imageObserver" ref={observerImageLoadRef} css={css`height: 1px; visibility: ${imageLoading ? "hidden" : "visible"};`} />}
                            {(!loading && imageLoading) && <LoadingWrap />}
                            {imageError &&
                                <NoMorePost>
                                    <span>포스트 로드 중 문제가 발생했습니다.</span>
                                    <motion.button className='retry_post_btn'
                                        variants={btnVariants(theme)}
                                        whileHover="loginHover"
                                        whileTap="loginClick"
                                        onClick={() => fetchNextPage()}>재요청</motion.button>
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
