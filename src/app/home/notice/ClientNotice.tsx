/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchPosts } from "@/app/api/loadToFirebasePostData/fetchPostData";
import { PostStyleBtn } from "@/app/layout";
import { noticeState, PostData, UsageLimitState, userState } from "@/app/state/PostState";
import { NoticeWrap, PostWrap } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

interface MainHomeProps {
    post: PostData[],
    initialNextPage: any;
}

export default function ClientNotice({ post: initialPosts, initialNextPage }: MainHomeProps) {

    // 포스트 스테이트
    const [notices, setNotices] = useRecoilState<PostData[]>(noticeState)
    const [newNotices, setNewNotices] = useState<PostData[]>([])

    // 현재 로그인 한 유저
    const currentUser = useRecoilValue(userState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)

    const pathName = usePathname();
    const observerLoadRef = useRef(null);
    // 무한 스크롤 로직
    const {
        data,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['notices'],
        queryFn: async ({ pageParam }) => {
            try {
                return fetchPosts(currentUser?.uid, pageParam, 4);
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

    // 무한 스크롤 로직의 data가 변할때 마다 posts 배열 업데이트
    useEffect(() => {
        const uniqueNotices = Array.from(
            new Map(
                [
                    ...notices, // fetchNewPosts로 가져온 최신 데이터
                    ...data.pages.flatMap((page) => page.data as PostData[]) // 무한 스크롤 데이터
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );

        setNotices(uniqueNotices); // 중복 제거된 포스트 배열을 posts에 저장
    }, [data.pages])

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (usageLimit) return console.log('함수 요청 안함.');

        const obsever = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerLoadRef.current) {
            obsever.observe(observerLoadRef.current);
        }

        return () => {
            if (observerLoadRef.current) obsever.unobserve(observerLoadRef.current);
        };
    }, [hasNextPage, fetchNextPage])

    useEffect(() => {
        console.log('페이지 이동')
        // 페이지 진입 시 스크롤 위치 복원
        const savedScroll = sessionStorage.getItem(`scroll-${pathName}`);

        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll, 10));
        }

        // 페이지 이탈 시 스크롤 위치 저장
        const saveScrollPosition = () => {
            sessionStorage.setItem(`scroll-${pathName}`, window.scrollY.toString());
            history.go(-1);
        };

        // 새로고침 및 창닫기 시 스크롤 위치 제거
        const resetScrollPosition = () => {
            sessionStorage.setItem(`scroll-${pathName}`, '0');
        };


        // 뒤로가기로 페이지 이탈 시 스크롤 위치 저장
        window.addEventListener('popstate', saveScrollPosition);
        window.addEventListener('beforeunload', resetScrollPosition);

        // 클린업
        return () => {
            window.removeEventListener('beforeunload', resetScrollPosition);
            window.removeEventListener('popstate', saveScrollPosition);
        };
    }, [pathName]);
    return (
        <>
            <NoticeWrap>
                <>
                    {/* 무한 스크롤 구조 */}
                    {notices.map((post) => (
                        <div key={post.id} className='post_box'>
                            {/* 작성자 프로필 */}
                            <div className='post_profile'>
                                <div className='user_profile'
                                    css={css`background-image : url(${post.PhotoURL})`}
                                ></div>
                                <p className='user_id'>
                                    {post.displayName}
                                </p>
                                <p className='post_date'>
                                    ·
                                </p>
                            </div>
                            {/* 포스트 제목 */}
                            <div className='post_title_wrap'>
                                <span className='post_tag'>{post.tag}</span>
                                <p className='post_title' >{post.title}</p>
                            </div>
                            {/* 포스트 내용 */}
                            <div className='post_content_wrap'>
                                {/* 이미지 */}
                                <div className='post_pr_img_wrap'>
                                    {(post.images && post.images.length > 0) && (
                                        post.images.map((imageUrl, index) => (
                                            <div className='post_pr_img'
                                                key={index}
                                                css={
                                                    css`background-image : url(${imageUrl});
                                                        height : 
                                                            ${(post.images && post.images?.length === 1) ? '400px'
                                                            :
                                                            (post.images && post.images?.length === 2) ? '300px'
                                                                :
                                                                '140px'
                                                        };`}>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            {/* 포스트 댓글, 북마크 등 */}
                            <div className='post_bottom_wrap'>
                                <div className='post_comment'>
                                    <div className='post_comment_icon'></div>
                                    <p>{post.commentCount}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    < div ref={observerLoadRef} style={{ height: '1px' }} />
                    {!hasNextPage && <p>제일 최근 메모입니다.</p>}
                </>
            </NoticeWrap>
        </>
    )
}