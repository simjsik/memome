/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { startTransition, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { DidYouLogin, loadingState, loginToggleState, modalState, newNoticeState, noticeList, noticeType, PostData, storageLoadState, UsageLimitState, UsageLimitToggle, userData, userState } from '../../state/PostState';
import { usePathname, useRouter } from 'next/navigation';
import { css, useTheme } from '@emotion/react';
import { Timestamp, } from 'firebase/firestore';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";

// Swiper
import socket from '@/app/utils/websocket';
import { Socket } from 'socket.io-client';
import { usePostUpdateChecker } from '@/app/hook/ClientPolling';
import BookmarkBtn from '@/app/components/BookmarkBtn';
import { fetchPosts } from '@/app/utils/fetchPostData';
import { NewPostBtn, NoMorePost, PostWrap } from '@/app/styled/PostComponents';
import LoadingWrap from '@/app/components/LoadingWrap';
import { useHandleUsernameClick } from '@/app/utils/handleClick';
import { btnVariants } from '@/app/styled/motionVariant';
import useOutsideClick from '@/app/hook/OutsideClickHook';
import { cleanHtml } from '@/app/utils/CleanHtml';
import { formatDate } from '@/app/utils/formatDate';
import { useAddUpdatePost } from './hook/usePostMutation';
import { useDelPost } from '../post/hook/useNewPostMutation';
import LoadLoading from '@/app/components/LoadLoading';
import Image from 'next/image';


export default function MainHome() {
  const theme = useTheme();
  const yourLogin = useRecoilValue(DidYouLogin)
  const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
  const setModal = useSetRecoilState<boolean>(modalState);
  const [loading, setLoading] = useRecoilState(loadingState);

  // 포스트 스테이트
  const [dropToggle, setDropToggle] = useState<string>('')

  // 공지사항 스테이트
  const setNewNotice = useSetRecoilState<boolean>(newNoticeState);
  const setNoticeLists = useSetRecoilState<noticeType[]>(noticeList);

  // 스토리지 기본 값 설정 용
  const setStorageLoad = useSetRecoilState<boolean>(storageLoadState);

  // 현재 로그인 한 유저
  const currentUser = useRecoilValue<userData>(userState)

  const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
  const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

  // state
  const router = useRouter();
  const pathName = usePathname();
  const observerLoadRef = useRef(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [routePostId, setRoutePostId] = useState<string | null>(null);
  // 웹소켓 연결---------------------------------------------------------------------------------
  const socketRef = useRef<Socket | null>(null);
  const uid = currentUser.uid

  useEffect(() => {
    // 설정 해주지 않으면 popstate 이벤트가 실행 안됨.
    window.history.pushState(null, "", window.location.pathname);

    // socket 객체를 초기화
    socketRef.current = socket; // socket은 외부에서 가져온 웹소켓 인스턴스

    const sockets = socketRef.current;

    // 새 공지 수신
    sockets.on("new-notice", () => {
      setNewNotice(true);
    });

    // 새 알림 수신
    sockets.on("initial-notices", (data) => {
      setNoticeLists(data);
    });

    // 포스팅 저장된 내용 확인. 있어야 이미지 불러와짐
    const savedData = JSON.parse(localStorage.getItem('unsavedPost')!);

    setLoading(false);

    if (savedData) {
      setStorageLoad(true);
    } else {
      setStorageLoad(false);
    }

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      sockets.off("new-notice");
      sockets.off("initial-notice");
      sockets.off("connect");
      sockets.off("disconnect");
    };
  }, []);

  // 사용 제한 시 웹소켓 연결 해제
  useEffect(() => {
    if (usageLimit) {
      const sockets = socketRef.current;

      // 소켓 연결 종료
      if (sockets) {
        sockets.close(); // 소켓 연결 종료
        socketRef.current = null; // 소켓 참조 초기화
      }

      return () => {
        // 이벤트 제거 (필요한 경우)
        if (sockets) {
          sockets.off("new-notice");
          sockets.off("initial-notice");
          sockets.off("connect");
          sockets.off("disconnect");
        }
      };
    }
  }, [usageLimit])

  // 유저가 로그인 되었을 때 uid를 웹소켓에 전송
  useEffect(() => {
    socketRef.current = socket;

    const sockets = socketRef.current;
    if (currentUser) {
      sockets.emit("register", { uid: currentUser?.uid }); // UID를 서버에 전송

      if (!currentUser.uid) return console.error('유저 없음');
    }
  }, [currentUser])

  // 무한 스크롤 로직----------------------------------------------------------------------------
  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isLoading: firstLoading,
    isFetching: dataLoading,
    isError,
    error,
  } = useInfiniteQuery<
    { data: PostData[]; nextPage: Timestamp | undefined }, // TQueryFnData
    Error, // TError
    InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>,// TData
    string[], // TQueryKey
    Timestamp | undefined // TPageParam
  >({
    retry: false, // 재시도 방지
    queryKey: ['posts'],
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

        return await fetchPosts(uid as string, pageParam, 8);
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
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
    initialPageParam: undefined,
  });

  const postList = posts?.pages.flatMap(page => page.data) || [];

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

  // 에러 시 사용 제한
  useEffect(() => {
    if (isError) {
      if (error.message === '사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.') {
        setUsageLimit(true);
      }
    }
  }, [isError])

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

  // 페이지 이동 시 스크롤 위치 저장
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

  // 포스트 삭제
  const { mutate: handledeletePost } = useDelPost();
  const deletePost = async (postId: string) => {
    const confirmed = confirm('게시글을 삭제 하시겠습니까?')
    if (!confirmed) return;
    handledeletePost(postId)
  }

  // 버튼 클릭 시 새 데이터 로드
  const { mutate: fetchUpdatePost, isPending: isAddUpdatePost } = useAddUpdatePost();
  const handleUpdateClick = () => {
    fetchUpdatePost();
  };

  const { hasUpdate } = usePostUpdateChecker();
  const handleUsernameClick = useHandleUsernameClick();
  return (
    <>
      {hasUpdate &&
        <NewPostBtn className='new_post_btn' onClick={handleUpdateClick}
          variants={btnVariants(theme)}
          whileHover="loginHover"
          whileTap="loginClick">새로운 업데이트 확인</NewPostBtn>
      }
      {/* 공지사항 제외 전체 포스트 */}
      <PostWrap id='main_post'>
        <section aria-labelledby='main_post'>
          {(!loading && isAddUpdatePost) && <LoadingWrap />}
          {/* 무한 스크롤 구조 */}
          {!loading && postList.map(post => (
            <>
              <motion.article
                whileHover="otherHover"
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
                    <time className='post_date'>
                      · {formatDate(post.createAt)}
                    </time>
                  </div>
                  <div className='post_dropdown_wrap' ref={dropdownRef}>
                    <motion.button
                      variants={btnVariants(theme)}
                      whileHover="iconWrapHover"
                      whileTap="iconWrapClick"
                      className='post_drop_menu_btn'
                      aria-label='포스트 옵션 더보기'
                      onClick={(event) => { event.preventDefault(); event.stopPropagation(); setDropToggle((prev) => (prev === post.id ? '' : post.id as string)); }}
                    >
                      <svg viewBox="0 0 40 40">
                        <g>
                          <path css={css`fill: ${theme.colors.text}; stroke : ${theme.colors.text}; stroke-width: 0.5;`} d="M12.57,21.5a1.5,1.5,0,0,0,0-3,1.5,1.5,0,0,0,0,3Z" />
                          <path css={css`fill: ${theme.colors.text}; stroke : ${theme.colors.text}; stroke-width: 0.5;`} d="M20,21.5a1.5,1.5,0,0,0,0-3,1.5,1.5,0,0,0,0,3Z" />
                          <path css={css`fill: ${theme.colors.text}; stroke : ${theme.colors.text}; stroke-width: 0.5;`} d="M27.43,21.5a1.5,1.5,0,0,0,0-3,1.5,1.5,0,0,0,0,3Z" />
                        </g>
                      </svg>
                      {dropToggle === post.id &&
                        <div>
                          <ul>
                            <li className='post_drop_menu'>
                              <motion.button
                                variants={btnVariants(theme)}
                                whileHover="otherHover"
                                onClick={(event) => { event.preventDefault(); event.stopPropagation(); deletePost(post.id as string); }} className='post_dlt_btn'>게시글 삭제</motion.button>
                            </li>
                          </ul>
                        </div>
                      }
                    </motion.button>
                  </div>
                </div>
                {/* 포스트 내용 */}
                <div className='post_content_wrap' onClick={(event) => { event.preventDefault(); handlePostClick(post.id as string); }}>
                  {/* 포스트 제목 */}
                  < div className='post_title_wrap' >
                    <span className='post_tag'>[{post.tag}]</span>
                    <h2 className='post_title'>{post.title}</h2>
                  </div>
                  <div className='post_text' dangerouslySetInnerHTML={{ __html: cleanHtml((post.content)) }}></div>
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
                    <BookmarkBtn postId={post.id as string}></BookmarkBtn>
                  </div>
                </div>
              </motion.article>
            </>
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
                onClick={() => fetchNextPage()}>재요청</motion.button>
            </NoMorePost>
          }
          {
            (!hasNextPage && !dataLoading && !loading) &&
            <>
              {postList.length > 0 ?
                <NoMorePost id='no_more_post' aria-live="polite" role="status">
                  <div className="no_more_icon">
                    <Image src={`https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966548/%EB%A9%94%EC%9D%B8%EB%8B%A4%EB%B4%A4%EC%9D%8C_fahwir.svg`}
                      alt="전체 포스트 확인 완료"
                      fill
                      style={{ objectFit: 'cover' }}
                    ></Image>
                  </div>
                  <p>모두 확인했습니다.</p>
                  <span>전체 메모를 전부 확인했습니다.</span>
                </NoMorePost>
                :
                <NoMorePost id='no_more_post' aria-live="polite" role="status">
                  <div className="no_more_icon">
                    <Image src={`https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966543/%EB%A9%94%EB%AA%A8%EC%97%86%EC%96%B4_d0sm6q.svg`}
                      alt="포스트 없음"
                      fill
                      style={{ objectFit: 'cover' }}
                    ></Image>
                  </div>
                  <p>메모가 없습니다.</p>
                  <span>전체 메모를 전부 확인했습니다.</span>
                </NoMorePost>
              }
            </>
          }
        </section >
      </PostWrap >
    </>
  )
}