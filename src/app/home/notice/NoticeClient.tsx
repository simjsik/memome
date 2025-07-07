/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchNoticePosts } from "@/app/utils/fetchPostData";
import { DidYouLogin, loadingState, loginToggleState, modalState, PostData, UsageLimitState, UsageLimitToggle, userState } from "@/app/state/PostState";
import { NoMorePost, PostWrap, } from "@/app/styled/PostComponents";
import { css, useTheme } from "@emotion/react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState, } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { motion } from "framer-motion";
import LoadingWrap from "@/app/components/LoadingWrap";
import { useHandleUsernameClick } from "@/app/utils/handleClick";
import { btnVariants } from "@/app/styled/motionVariant";
import { formatDate } from "@/app/utils/formatDate";
import { useDelPost } from "../post/hook/useNewPostMutation";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { cleanHtml } from "@/app/utils/CleanHtml";
import useOutsideClick from "@/app/hook/OutsideClickHook";
import LoadLoading from "@/app/components/LoadLoading";
import Image from "next/image";

export default function ClientNotice() {
    const theme = useTheme();
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [loading, setLoading] = useRecoilState(loadingState);
    const [dropToggle, setDropToggle] = useState<string>('')
    const [routePostId, setRoutePostId] = useState<string | null>(null);
    // 포스트 스테이트

    // 현재 로그인 한 유저
    const currentUser = useRecoilValue(userState)
    const dropdownRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const pathName = usePathname();
    const observerLoadRef = useRef(null);
    const uid = currentUser.uid

    // 무한 스크롤 로직
    const {
        data: notices,
        fetchNextPage,
        hasNextPage,
        isLoading: firstLoading,
        isFetching: dataLoading,
        isError,
    } = useInfiniteQuery<
        { data: PostData[]; nextPage: Timestamp | undefined }, // TQueryFnData
        Error, // TError
        InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>,
        string[], // TQueryKey
        Timestamp | undefined // TPageParam
    >({
        retry: false,
        queryKey: ['notices'],
        queryFn: async ({ pageParam }) => {
            try {
                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid }),
                });
                if (!validateResponse.ok) {
                    const errorDetails = await validateResponse.json();
                    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
                }

                return fetchNoticePosts(uid as string, pageParam);
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

    const noticeList = notices?.pages.flatMap(page => page.data) || [];

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
                if (entries[0].isIntersecting && hasNextPage && !dataLoading) {
                    fetchNextPage();
                }
            },
            {
                threshold: 1.0,
                rootMargin: '0px 0px 20px 0px',
            }
        );

        if (observerLoadRef.current) {
            obsever.observe(observerLoadRef.current);
        }

        return () => {
            if (observerLoadRef.current) obsever.unobserve(observerLoadRef.current);
        };
    }, [hasNextPage, fetchNextPage])

    // 포스트 보기
    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        if (usageLimit) {
            return setLimitToggle(true);
        }
        setRoutePostId(postId);
        setTimeout(() => {
            startTransition(() => {
                router.push(`memo/${postId}`)
            });
        }, 0);
    }

    const { mutate: handledeletePost } = useDelPost();

    // 포스트 삭제
    const deletePost = async (postId: string) => {
        const confirmed = confirm('게시글을 삭제 하시겠습니까?')
        if (!confirmed) return;
        handledeletePost(postId)
    }

    // 에러 발생 시 데이터 요청 중지
    useEffect(() => {
        if (isError) {
            setUsageLimit(true);
        }
    }, [isError])

    useEffect(() => {
        setLoading(false); // 초기 로딩 해제
    }, [])

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

    // 외부 클릭 시 드롭다운 닫기
    useOutsideClick(dropdownRef, () => {
        if (dropToggle) {
            setDropToggle('');
        }
    });

    const handleUsernameClick = useHandleUsernameClick();
    return (
        <>
            <PostWrap id="notice_post">
                <section aria-labelledby="notice_post">
                    {/* 무한 스크롤 구조 */}
                    {!loading && noticeList.map((post) => (
                        <motion.div
                            whileHover='otherHover'
                            variants={btnVariants(theme)}
                            key={post.id}
                            className='post_box'
                        >
                            {routePostId === post.id && <LoadLoading />}
                            {/* 작성자 프로필 */}
                            <div className='post_profile_wrap'>
                                <div className='user_profile'>
                                    <div className='user_photo'
                                        css={css`background-image : url(${post.photoURL})`}
                                    >
                                    </div>
                                    <p className='user_name'
                                        onClick={(e) => { e.preventDefault(); handleUsernameClick(post.userId); }}
                                    >
                                        {post.displayName}
                                    </p>
                                    <span className='user_uid'>
                                        @{post.userId.slice(0, 6)}...
                                    </span>
                                    <p className='post_date'>
                                        · {formatDate(post.createAt)}
                                    </p>
                                </div>
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
                            </div>
                            {/* 포스트 내용 */}
                            <div className='post_content_wrap' onClick={(event) => { event.preventDefault(); handlePostClick(post.id); }}>
                                {/* 포스트 제목 */}
                                < div className='post_title_wrap'>
                                    <span className='notice_tag post_tag'>{post.tag}</span>
                                    <h2 className='notice_title'>{post.title}</h2>
                                </div>
                                <div className='post_text' dangerouslySetInnerHTML={{ __html: cleanHtml(post.content) }}></div>
                                {/* 이미지 */}
                                {(post.images && post.images.length > 0) && (
                                    <div className='post_pr_img_wrap'>
                                        <div className='post_pr_img'>
                                            <Image
                                                src={post.images[0]}
                                                alt="포스트 이미지"
                                                fill
                                                style={{ objectFit: 'cover' }} />
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
                                                        <path fill='none' css={css`stroke : ${theme.colors.text}; stroke-width: 5;`} d="M48.23,6.7h-29C12.29,6.7,6.7,11.59,6.7,17.62V40.77c0,6,2.61,10.91,9.5,10.91h.91a1.84,1.84,0,0,1,1.95,1.71v5.26c0,1.55,1.88,2.54,3.45,1.81l13.72-8.32a4.9,4.9,0,0,1,2.08-.46h9.92c6.89,0,12.47-4.88,12.47-10.91V17.62C60.7,11.59,55.12,6.7,48.23,6.7Z" />
                                                        <rect width="67.41" height="67.41" fill='none' />
                                                    </g>
                                                </svg>
                                            </motion.div>
                                        </motion.button>
                                        <p>{post.commentCount}</p>
                                    </div>
                                    <BookmarkBtn postId={post.id}></BookmarkBtn>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={observerLoadRef} css={css`height: 1px; visibility: ${(dataLoading || firstLoading) ? "hidden" : "visible"};`} />
                    {(!loading && dataLoading) && <LoadingWrap />}
                    {isError &&
                        <NoMorePost id='post_error' aria-live='polite' role='status'>
                            <span>포스트 로드 중 문제가 발생했습니다.</span>
                            <motion.button className='retry_post_btn'
                                variants={btnVariants(theme)}
                                whileHover="loginHover"
                                whileTap="loginClick"
                                onClick={() => fetchNextPage()}>재요청</motion.button>
                        </NoMorePost>
                    }
                    {(!dataLoading && !hasNextPage && !loading) &&
                        <>
                            {
                                noticeList.length > 0 ?
                                    <NoMorePost>
                                        <div className="no_more_icon">
                                            <Image src={`https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966540/%EA%B3%B5%EC%A7%80%EB%8B%A4%EB%B4%A4%EC%96%B4_lbmtbv.svg`}
                                                alt="전체 포스트 확인 완료"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            ></Image></div>
                                        <p>모두 확인했습니다.</p>
                                        <span>전체 공지사항을 전부 확인했습니다.</span>
                                    </NoMorePost>
                                    :
                                    <NoMorePost>
                                        <div className="no_more_icon">
                                            <Image src={`https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966540/%EA%B3%B5%EC%A7%80%EC%97%86%EC%96%B4_xkphgs.svg`}
                                                alt="전체 포스트 확인 완료"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            ></Image></div>
                                        <p>공지사항이 없습니다.</p>
                                        <span>전체 공지사항을 전부 확인했습니다.</span>
                                    </NoMorePost>
                            }
                        </>
                    }
                </section>
            </PostWrap>
        </>
    )
}