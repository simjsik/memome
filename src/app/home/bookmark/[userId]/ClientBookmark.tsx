/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { bookMarkState, loadingState, PostData, UsageLimitState, UsageLimitToggle, userData, userState } from "@/app/state/PostState";
import { NoMorePost, PostWrap } from "@/app/styled/PostComponents";
import { css, useTheme } from "@emotion/react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
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
import Image from "next/image";

export default function Bookmark() {
    const currentBookmark = useRecoilValue<string[]>(bookMarkState)
    const currentUser = useRecoilValue<userData>(userState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [loading, setLoading] = useRecoilState(loadingState);
    const [routePostId, setRoutePostId] = useState<string | null>(null);
    const router = useRouter();
    const observerLoadRef = useRef(null);
    const theme = useTheme();
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

    const {
        data: bookmarks,
        fetchNextPage,
        hasNextPage,
        isLoading: firstLoading,
        isFetching: dataLoading,
        isError,
        error
    } = useInfiniteQuery<
        { data: PostData[]; nextPage: number | undefined }, // TQueryFnData
        Error, // TError
        InfiniteData<{ data: PostData[]; nextPage: number | undefined }>,// TData
        string[], // TQueryKey
        number | undefined // TPageParam
    >({
        queryKey: ['bookmarks', currentUser?.uid as string],
        queryFn: async ({ pageParam = 0 }) => {
            try {
                const csrf = document.cookie.split('; ').find(c => c?.startsWith('csrfToken='))?.split('=')[1];
                const csrfValue = csrf ? decodeURIComponent(csrf) : '';

                const response = await fetch(`/api/post/bookmark`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Project-Host': window.location.origin,
                        'x-csrf-token': csrfValue
                    },
                    body: JSON.stringify({ bookmarkId: currentBookmark, pageParam, pageSize: 4 }),
                    credentials: "include",
                });
                if (!response.ok) {
                    // 상태별 메시지
                    if (response.status === 429) throw new Error('LM');
                    if (response.status === 403 || response.status === 401) throw new Error('FB');
                    const msg = await response.text().catch(() => '');
                    throw new Error(msg || `요청 실패 (${response.status})`);
                }

                const data = await response.json();
                return data
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    throw error;
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage || undefined, // 다음 페이지 인덱스 반환
        staleTime: 5 * 60 * 1000, // 5분 동안 데이터 캐싱 유지
        initialPageParam: 0, // 초기 페이지 파라미터 설정
        enabled: (!loading && currentBookmark.length > 0)
    });

    const bookmarkList = bookmarks?.pages.flatMap(page => page?.data) || [];

    useEffect(() => {
        if (isError) {
            if (error.message === 'LM') {
                setUsageLimit(true);
            }
        }
    }, [isError])


    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (usageLimit || !currentBookmark) return;

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
        setLoading(false);
    }, [])

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
            <PostWrap id='bookmark_post'>
                <section aria-labelledby="bookmark_post">
                    {!loading && <h2 className='all_post'>내 북마크</h2>}
                    {/* 무한 스크롤 구조 */}
                    {!loading && bookmarkList.length > 0 && bookmarkList.map((post) => (
                        <motion.article
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
                                    <p className='user_name'
                                        onClick={(e) => { e.preventDefault(); handleUsernameClick(post?.userId as string); }}
                                    >
                                        {post?.displayName}
                                    </p>
                                    <span className='user_uid'>
                                        @{post?.userId.slice(0, 6)}...
                                    </span>
                                    <time className='post_date'>
                                        · {formatDate(post?.createAt)}
                                    </time>
                                </div>
                                <button
                                    className='post_drop_menu_btn'
                                    css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736451404/%EB%B2%84%ED%8A%BC%EB%8D%94%EB%B3%B4%EA%B8%B0_obrxte.svg)`}
                                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
                                    aria-label="포스트 옵션"
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
                                {post?.thumbnail && (
                                    <div className='post_pr_img_wrap'>
                                        <div className='post_pr_img'>
                                            <Image
                                                src={post.thumbnail as string}
                                                alt="포스트 이미지"
                                                fill
                                                css={css`object-fit: cover`} />
                                            {post.hasImage &&
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
                                            whileTap="iconWrapClick" className='post_comment_btn'
                                            aria-label="포스트 댓글">
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
                        </motion.article>
                    ))
                    }
                    <div ref={observerLoadRef} css={css`height: 1px; visibility: ${(dataLoading || firstLoading) ? "hidden" : "visible"};`} />
                    {(!loading && dataLoading) && <LoadingWrap />}
                    {isError &&
                        <NoMorePost id='post_error' aria-live='polite' role='status'>
                            <span>포스트 로드 중 문제가 발생했습니다.</span>
                            <motion.button className='retry_post_btn'
                                variants={btnVariants(theme)}
                                whileHover="loginHover"
                                whileTap="loginClick"
                                onClick={() => fetchNextPage()}
                                aria-label="포스트 재요청">재요청</motion.button>
                        </NoMorePost>
                    }
                    {
                        (!hasNextPage && !dataLoading && !loading) &&
                        <>
                            {bookmarkList.length > 0 ?
                                <NoMorePost id='no_more_post' aria-live="polite" role="status">
                                    <div className="no_more_icon">
                                        <Image src={`https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744965256/%EB%B6%81%EB%A7%88%ED%81%AC%EB%8B%A4%EB%B4%A4%EC%96%B4_vvrw2f.svg`}
                                            alt="전체 포스트 확인 완료"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        ></Image>
                                    </div>
                                    <p>모두 확인했습니다.</p>
                                    <span>북마크된 메모를 전부 확인했습니다.</span>
                                </NoMorePost>
                                :
                                <NoMorePost id='no_more_post' aria-live="polite" role="status">
                                    <div className="no_more_icon">
                                        <Image src={`https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744965256/%EB%B6%81%EB%A7%88%ED%81%AC%EC%97%86%EC%96%B4_fkhi4n.svg`}
                                            alt="포스트 없음"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        ></Image>
                                    </div>
                                    <p>북마크된 메모가 없습니다.</p>
                                    <span>페이지를 탐색 후 원하는 메모를 북마크 해보세요.</span>
                                </NoMorePost>
                            }
                        </>
                    }
                </section>
            </PostWrap >
        </>
    )
}