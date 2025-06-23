/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { fetchBookmarks } from "@/app/utils/fetchPostData";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { bookMarkState, loadingState, UsageLimitState, UsageLimitToggle, userData, userState } from "@/app/state/PostState";
import { NoMorePost, PostWrap } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { motion } from "framer-motion";

import LoadingWrap from "@/app/components/LoadingWrap";
import { useHandleUsernameClick } from "@/app/utils/handleClick";
import { btnVariants } from "@/app/styled/motionVariant";
import { cleanHtml } from "@/app/utils/CleanHtml";
import { formatDate } from "@/app/utils/formatDate";
import LoadLoading from "@/app/components/LoadLoading";

export default function Bookmark() {
    const currentBookmark = useRecoilValue<string[]>(bookMarkState)
    const currentUser = useRecoilValue<userData>(userState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [loading, setLoading] = useRecoilState(loadingState);
    const [routePostId, setRoutePostId] = useState<string | null>(null);
    const router = useRouter();
    const observerLoadRef = useRef(null);

    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

    const uid = currentUser.uid

    const {
        data: bookmarks,
        fetchNextPage,
        hasNextPage,
        refetch,
        isLoading: firstLoading,
        isFetching: dataLoading,
        isError,  // 에러 상태
        // error,    // 에러 메시지
    } = useInfiniteQuery({
        retry: false,
        queryKey: ['bookmarks', currentUser?.uid],
        queryFn: async ({ pageParam = 0 }) => {
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

                return fetchBookmarks(
                    currentUser.uid as string,
                    currentBookmark, // 전역 상태를 바로 사용
                    pageParam, // 시작 인덱스
                    4, // 한 번 요청할 데이터 수
                );
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
        getNextPageParam: (lastPage) => lastPage?.nextIndexData, // 다음 페이지 인덱스 반환
        staleTime: 5 * 60 * 1000, // 5분 동안 데이터 캐싱 유지
        initialPageParam: 0, // 초기 페이지 파라미터 설정
    });

    const bookmarkList = bookmarks?.pages.flatMap(page => page?.data) || [];

    useEffect(() => {
        if (isError) {
            setUsageLimit(true);
        }
    }, [isError])

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (usageLimit) return console.log('함수 요청 안함.');

        if (currentBookmark.length > 0 || (bookmarks && bookmarks.pages.length > 0)) {
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
                if (observerLoadRef.current) observer.unobserve(observerLoadRef.current);
                observer.disconnect();
            };
        }

    }, [hasNextPage, fetchNextPage, currentBookmark, bookmarks]);

    useEffect(() => {
        setLoading(false)
    }, [])

    useEffect(() => {
        if (currentBookmark.length > 0) {
            refetch();
        }
    }, [currentBookmark])

    // 포스트 보기
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


    const handleUsernameClick = useHandleUsernameClick();
    return (
        <>
            {!usageLimit &&
                <PostWrap>
                    {!loading && <p className='all_post'>내 북마크</p>}
                    {/* 무한 스크롤 구조 */}
                    {!loading && bookmarkList.length > 0 && bookmarkList.map((post) => (
                        <motion.div
                            key={post?.id}
                            className='post_box'
                            onClick={(event) => { event.preventDefault(); handlePostClick(post?.id as string); }}
                            whileHover={{
                                backgroundColor: "#fafbfc",
                                transition: { duration: 0.1 },
                            }}
                        >
                            {routePostId === post?.id && <LoadLoading />}
                            {/* 작성자 프로필 */}
                            <div className='post_profile_wrap'>
                                <div className='user_profile'>
                                    <div className='user_photo'
                                        css={css`background-image : url(${post?.photoURL})`}
                                    >
                                    </div>
                                    <p className='user_name'
                                        onClick={(e) => { e.preventDefault(); handleUsernameClick(post?.userId as string); }}
                                    >
                                        {post?.displayName}
                                    </p>
                                    <span className='user_uid'>
                                        @{post?.userId.slice(0, 6)}...
                                    </span>
                                    <p className='post_date'>
                                        · {formatDate(post?.createAt as Timestamp)}
                                    </p>
                                </div>
                                <button
                                    className='post_drop_menu_btn'
                                    css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736451404/%EB%B2%84%ED%8A%BC%EB%8D%94%EB%B3%B4%EA%B8%B0_obrxte.svg)`}
                                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
                                >
                                </button>
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
                                        <div className='post_pr_img' css={css`background-image : url(${post?.images[0]});`}>
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
                                            variants={btnVariants}
                                            whileHover="iconWrapHover"
                                            whileTap="iconWrapClick" className='post_comment_btn'>
                                            <motion.div
                                                variants={btnVariants}
                                                whileHover="iconHover"
                                                whileTap="iconClick" className='post_comment_icon'>
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
                    <div ref={observerLoadRef} css={css`height: 1px; visibility: ${(dataLoading || firstLoading) ? "hidden" : "visible"};`} />
                    {(!loading && dataLoading) && <LoadingWrap />}
                    {
                        (!dataLoading && !hasNextPage && bookmarkList.length > 0 && !loading) &&
                        <NoMorePost>
                            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744965256/%EB%B6%81%EB%A7%88%ED%81%AC%EB%8B%A4%EB%B4%A4%EC%96%B4_vvrw2f.svg)`}></div>
                            <p>모두 확인했습니다.</p>
                            <span>북마크된 메모를 전부 확인했습니다.</span>
                        </NoMorePost>
                    }
                    {
                        (!dataLoading && bookmarkList.length === 0 && !loading) &&
                        <NoMorePost>
                            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744965256/%EB%B6%81%EB%A7%88%ED%81%AC%EC%97%86%EC%96%B4_fkhi4n.svg)`}></div>
                            <p>북마크된 메모가 없습니다.</p>
                            <span>페이지를 탐색 후 원하는 메모를 북마크 해보세요.</span>
                        </NoMorePost>
                    }
                </PostWrap >
            }
        </>
    )
}