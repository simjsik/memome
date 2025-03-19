/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { fetchBookmarks } from "@/app/utils/fetchPostData";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { bookMarkState, PostData, UsageLimitState, userBookMarkState, userData, userState } from "@/app/state/PostState";
import { NoMorePost, PostWrap } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import LoadingWrap from "@/app/components/LoadingWrap";

export default function Bookmark() {
    const currentBookmark = useRecoilValue<string[]>(bookMarkState)
    const [userBookmarks, setUserBookmarks] = useRecoilState<PostData[]>(userBookMarkState)
    const currentUser = useRecoilValue<userData>(userState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [dataLoading, setDataLoading] = useState<boolean>(false);

    const router = useRouter();
    const observerLoadRef = useRef(null);

    const uid = currentUser.uid

    const {
        data: bookmarkPages,
        fetchNextPage,
        hasNextPage,
        refetch,
        isError,  // 에러 상태
        // error,    // 에러 메시지
    } = useInfiniteQuery({
        retry: false,
        queryKey: ['bookmarks', currentUser?.uid],
        queryFn: async ({ pageParam = 0 }) => {
            try {
                setDataLoading(true);
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
                    currentUser.uid,
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
            } finally {
                setDataLoading(false);
            }

        },
        getNextPageParam: (lastPage) => lastPage?.nextIndexData, // 다음 페이지 인덱스 반환
        staleTime: 5 * 60 * 1000, // 5분 동안 데이터 캐싱 유지
        initialPageParam: 0, // 초기 페이지 파라미터 설정
    });

    useEffect(() => {
        if (isError) {
            setUsageLimit(true);
        }
    }, [isError])

    useEffect(() => {
        const uniquePosts = Array.from(
            new Map(
                [
                    ...userBookmarks, // fetchNewPosts로 가져온 최신 데이터
                    ...(bookmarkPages?.pages
                        ?.flatMap((page) => page?.data || [])
                        .filter((post): post is PostData => !!post) || []),
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );

        setUserBookmarks(uniquePosts); // 중복 제거된 포스트 배열을 posts에 저장
    }, [bookmarkPages?.pages])

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (usageLimit) return console.log('함수 요청 안함.');

        if (currentBookmark.length > 0 || (bookmarkPages && bookmarkPages.pages.length > 0)) {
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

    }, [hasNextPage, fetchNextPage, currentBookmark, bookmarkPages]);

    useEffect(() => {
        if (bookmarkPages && bookmarkPages.pages.length > 0) {
            fetchNextPage();
        }
    }, [])

    useEffect(() => {
        if (currentBookmark.length > 0) {
            refetch();
        }
    }, [currentBookmark])

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

    // 포스트 보기
    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        router.push(`memo/${postId}`)
    }

    return (
        <>
            {!usageLimit &&
                <PostWrap>
                    {/* 무한 스크롤 구조 */}
                    {userBookmarks.map((post) => (
                        <div
                            key={post.id}
                            className='post_box'
                            onClick={(event) => { event.preventDefault(); handlePostClick(post.id); }}>
                            {/* 작성자 프로필 */}
                            <div className='post_profile_wrap'>
                                <div className='user_profile'>
                                    <div className='user_photo'
                                        css={css`background-image : url(${post.PhotoURL})`}
                                    >
                                    </div>
                                    <p className='user_name'>
                                        {post.displayName}
                                    </p>
                                    <span className='user_uid'>
                                        @{post.userId.slice(0, 6)}...
                                    </span>
                                    <p className='post_date'>
                                        · {formatDate(post.createAt)}
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
                                    <span className='post_tag'>[{post.tag}]</span>
                                    <h2 className='post_title'>{post.title}</h2>
                                </div>
                                <div className='post_text' dangerouslySetInnerHTML={{ __html: post.content }}></div>
                                {/* 이미지 */}
                                {(post.images && post.images.length > 0) && (
                                    <div className='post_pr_img_wrap'>
                                        {post.images.map((imageUrl, index) => (
                                            <div className='post_pr_img' key={index}
                                                css={css`background-image : url(${imageUrl})`}
                                            ></div>
                                        ))}
                                    </div>
                                )}

                                {/* 포스트 댓글, 북마크 등 */}
                                <div className='post_bottom_wrap'>
                                    <div className='post_comment'>
                                        <button className='post_comment_btn'>
                                            <div className='post_comment_icon'>
                                            </div>
                                        </button>
                                        <p>{post.commentCount}</p>
                                    </div>
                                    <BookmarkBtn postId={post.id}></BookmarkBtn>
                                </div>
                            </div>
                        </div >
                    ))
                    }
                    < div ref={observerLoadRef} style={{ height: '1px' }} />
                    {dataLoading && <LoadingWrap />}
                    {
                        (!hasNextPage && userBookmarks.length > 0) &&
                        <NoMorePost>
                            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                            <p>모두 확인했습니다.</p>
                            <span>북마크된 메모를 전부 확인했습니다.</span>
                        </NoMorePost>
                    }
                    {
                        userBookmarks.length === 0 &&
                        <NoMorePost>
                            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                            <p>북마크된 메모가 없습니다.</p>
                            <span>페이지를 탐색 후 원하는 메모를 북마크 해보세요.</span>
                        </NoMorePost>
                    }
                </PostWrap >
            }
        </>
    )
}