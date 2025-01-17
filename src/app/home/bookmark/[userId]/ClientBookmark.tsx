/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { fetchBookmarks } from "@/app/api/loadToFirebasePostData/fetchPostData";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { auth, db } from "@/app/DB/firebaseConfig";
import { ADMIN_ID, bookMarkState, PostData, UsageLimitState, userBookMarkState, userData, userState } from "@/app/state/PostState";
import { NoMorePost, PostListStyle, PostWrap } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function Bookmark() {
    const ADMIN = useRecoilValue(ADMIN_ID);
    const [currentBookmark, setCurrentBookmark] = useRecoilState<string[]>(bookMarkState)
    const [userBookmarks, setUserBookmarks] = useRecoilState<PostData[]>(userBookMarkState)
    const [currentUser, setCurrentUser] = useRecoilState<userData | null>(userState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const router = useRouter();
    const observerLoadRef = useRef(null);

    const {
        data: bookmarkPages,
        fetchNextPage,
        hasNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['bookmarks', currentUser?.uid],
        queryFn: async ({ pageParam = 0 }) => {
            const result = await fetchBookmarks(
                currentUser?.uid!,
                currentBookmark, // 전역 상태를 바로 사용
                pageParam, // 시작 인덱스
                4, // 한 번 요청할 데이터 수
            );
            if (!result) throw new Error('사용량 제한 초과');
            return result;
        },
        getNextPageParam: (lastPage) => lastPage.nextIndexData, // 다음 페이지 인덱스 반환
        staleTime: 5 * 60 * 1000, // 5분 동안 데이터 캐싱 유지
        initialPageParam: 0, // 초기 페이지 파라미터 설정
        initialData: {
            pages: [
                {
                    data: [], // 초기 북마크 데이터
                    nextIndexData: 0, // 초기 다음 페이지 인덱스
                },
            ],
            pageParams: [0], // 초기 페이지 인덱스
        },
    });

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (usageLimit) return console.log('함수 요청 안함.');

        if (currentBookmark.length > 0 || bookmarkPages.pages.length > 0) {
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
        if (bookmarkPages.pages.length > 0) {
            fetchNextPage();
        }
    }, [])

    useEffect(() => {
        if (currentBookmark.length > 0) {
            refetch();
        }
    }, [currentBookmark])

    useEffect(() => {
        const uniquePosts = Array.from(
            new Map(
                [
                    ...userBookmarks, // fetchNewPosts로 가져온 최신 데이터
                    ...bookmarkPages.pages.flatMap((page) => page.data as PostData[]) // 무한 스크롤 데이터
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );

        setUserBookmarks(uniquePosts); // 중복 제거된 포스트 배열을 posts에 저장
    }, [bookmarkPages.pages])

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

    // 포스트 보기
    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        router.push(`memo/${postId}`)
    }

    const deleteBookmark = async (postId: string | string[]) => {
        if (currentUser) {
            const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/bookmarkId`);

            if (confirm('해당 북마크를 취소 하시겠습니까?')) {
                try {
                    await updateDoc(bookmarkRef, {
                        bookmarkId: arrayRemove(postId),
                    }); // 배열 형태일 때 선택한 포스트 id 삭제.

                    // 북마크 해제 후 북마크 state 업데이트
                    setCurrentBookmark((prev) => prev.filter((id) => id !== postId));
                    alert('북마크가 해제되었습니다.');
                } catch (error) {
                    console.error('북마크 삭제 중 오류 발생:', error);
                    alert(error || '북마크 삭제 중 오류가 발생했습니다.');
                }
                alert('북마크가 해제되었습니다.')
                router.refresh();
            } else {
                return;
            }
        }
    }

    return (
        <>
            {!usageLimit &&
                <PostWrap postStyle={true}>
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
                    {
                        !hasNextPage &&
                        <NoMorePost>
                            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                            <p>모두 확인했습니다.</p>
                            <span>북마크된 메모를 전부 확인했습니다.</span>
                        </NoMorePost>
                    }
                </PostWrap >
            }
        </>
    )
}