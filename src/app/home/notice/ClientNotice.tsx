/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchNoticePosts } from "@/app/api/utils/fetchPostData";
import { DidYouLogin, loginToggleState, modalState, noticeState, PostData, UsageLimitState, UsageLimitToggle, userState } from "@/app/state/PostState";
import { NoMorePost, NoticeWrap, } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useEffect, useRef, } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

interface MainHomeProps {
    post: PostData[],
    initialNextPage: [boolean, Timestamp] | [boolean, null]
}

export default function ClientNotice({ post: initialPosts, initialNextPage }: MainHomeProps) {
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)

    // 포스트 스테이트
    const [notices, setNotices] = useRecoilState<PostData[]>(noticeState)

    // 현재 로그인 한 유저
    const currentUser = useRecoilValue(userState)

    const pathName = usePathname();
    const observerLoadRef = useRef(null);
    const uid = currentUser.uid

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
    // 무한 스크롤 로직
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isError,  // 에러 상태
        // error,    // 에러 메시지
    } = useInfiniteQuery({
        retry: false,
        queryKey: ['notices'],
        queryFn: async ({ pageParam }) => {
            const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validateAuthToken`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ uid }),
            });

            if (!validateResponse.ok) {
                const errorDetails = await validateResponse.json();
                throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
            }

            return fetchNoticePosts(uid, pageParam, 4);
        },
        getNextPageParam: (lastPage) => {
            // 사용량 초과 시 페이지 요청 중단
            if (!lastPage.nextPage) return;

            return lastPage.nextPage;
        },
        staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
        initialPageParam: initialNextPage, // 초기 페이지 파라미터 설정
        initialData: {
            pages: [{ data: initialPosts, nextPage: initialNextPage }],
            pageParams: [initialNextPage],
        },
    });

    // 무한 스크롤 로직의 data가 변할때 마다 posts 배열 업데이트
    useEffect(() => {
        if (usageLimit) return;
        const uniqueNotices = Array.from(
            new Map(
                [
                    ...notices, // fetchNewPosts로 가져온 최신 데이터
                    ...(data.pages
                        ?.flatMap((page) => page?.data || [])
                        .filter((post): post is PostData => !!post) || []),
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );

        setNotices(uniqueNotices); // 중복 제거된 포스트 배열을 posts에 저장
    }, [data.pages])

    useEffect(() => {
        if (isError) {
            setUsageLimit(true);
        }
    }, [isError])

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
        if (!yourLogin || usageLimit) {
            if (usageLimit) {
                setLimitToggle(true);
                setModal(true);
            }
            if (!yourLogin) {
                setLoginToggle(true);
                setModal(true);
            }
            return;
        }

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
                            {/* 포스트 내용 */}
                            <div className='post_content_wrap'>
                                {/* 포스트 제목 */}
                                <div className='post_title_wrap'>
                                    <span className='post_tag'>{post.tag}</span>
                                    <p className='post_title' >{post.title}</p>
                                </div>
                                <div className="post_content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                                {/* 이미지 */}
                                {(post.images && post.images.length > 0) &&
                                    <div className='post_pr_img_wrap'>
                                        {post.images.map((imageUrl, index) => (
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
                                        ))}
                                    </div>
                                }
                                {/* 포스트 댓글, 북마크 등 */}
                                <div className='post_bottom_wrap'>
                                    <div className='post_comment'>
                                        <div className="post_comment_icon_wrap">
                                            <div className='post_comment_icon' css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449945/%EB%8C%93%EA%B8%80%EC%95%84%EC%9D%B4%EC%BD%98_xbunym.svg)`}></div>
                                        </div>
                                        <p>{post.commentCount}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                    < div ref={observerLoadRef} style={{ height: '1px' }} />
                    {!hasNextPage &&
                        <NoMorePost>
                            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                            <p>모두 확인했습니다.</p>
                            <span>전체 공지사항을 전부 확인했습니다.</span>
                        </NoMorePost>
                    }
                </>
            </NoticeWrap>
        </>
    )
}