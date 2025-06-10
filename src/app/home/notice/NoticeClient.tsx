/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchNoticePosts } from "@/app/utils/fetchPostData";
import { DidYouLogin, loadingState, loginToggleState, modalState, PostData, UsageLimitState, UsageLimitToggle, userState } from "@/app/state/PostState";
import { NoMorePost, PostWrap, } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, } from "react";
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

export default function ClientNotice() {
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [loading, setLoading] = useRecoilState(loadingState);
    const [dropToggle, setDropToggle] = useState<string>('')

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
        router.push(`memo/${postId}`)
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
            <PostWrap>
                <>
                    {/* 무한 스크롤 구조 */}
                    {!loading && noticeList.map((post) => (
                        <motion.div
                            whileHover={{
                                backgroundColor: "#fafbfc",
                                transition: { duration: 0.1 },
                            }}
                            key={post.id}
                            className='post_box'
                        >
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
                                        variants={btnVariants}
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
                                                            variants={btnVariants}
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
                                        <div className='post_pr_img'
                                            css={css
                                                `
                                                    background-image : url(${post.images[0]});
                                                `}
                                        >
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
                        <NoMorePost>
                            <span>포스트 로드 중 문제가 발생했습니다.</span>
                            <motion.div className='retry_post_btn'
                                variants={btnVariants}
                                whileHover="loginHover"
                                whileTap="loginClick">재요청</motion.div>
                        </NoMorePost>
                    }
                    {(!dataLoading && !hasNextPage && !loading) &&
                        <>
                            {
                                noticeList.length > 0 ?
                                    <NoMorePost>
                                        <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966540/%EA%B3%B5%EC%A7%80%EB%8B%A4%EB%B4%A4%EC%96%B4_lbmtbv.svg)`}></div>
                                        <p>모두 확인했습니다.</p>
                                        <span>전체 공지사항을 전부 확인했습니다.</span>
                                    </NoMorePost>
                                    :
                                    <NoMorePost>
                                        <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966540/%EA%B3%B5%EC%A7%80%EC%97%86%EC%96%B4_xkphgs.svg)`}></div>
                                        <p>공지사항이 없습니다.</p>
                                        <span>전체 공지사항을 전부 확인했습니다.</span>
                                    </NoMorePost>
                            }
                        </>
                    }
                </>
            </PostWrap>
        </>
    )
}