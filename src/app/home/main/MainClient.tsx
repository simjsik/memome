/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ADMIN_ID, DidYouLogin, loginToggleState, modalState, newNoticeState, noticeList, noticeType, PostData, PostState, storageLoadState, UsageLimitState, UsageLimitToggle, userData, userState } from '../../state/PostState';
import { usePathname, useRouter } from 'next/navigation';
import { css } from '@emotion/react';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, startAfter, Timestamp, where } from 'firebase/firestore';
import { db } from '../../DB/firebaseConfig';
import { useInfiniteQuery } from '@tanstack/react-query';

// Swiper
import socket from '@/app/utils/websocket';
import { Socket } from 'socket.io-client';
import { usePostUpdateChecker } from '@/app/hook/ClientPolling';
import BookmarkBtn from '@/app/components/BookmarkBtn';
import { fetchPosts } from '@/app/utils/fetchPostData';
import { NewPostBtn, NoMorePost, PostWrap } from '@/app/styled/PostComponents';

interface MainHomeProps {
    post: PostData[],
    initialNextPage: [boolean, Timestamp] | null,
}

export default function MainHome({ post: initialPosts, initialNextPage }: MainHomeProps) {
    // window.history.scrollRestoration = 'manual'

    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);

    // 포스트 스테이트
    const [posts, setPosts] = useRecoilState<PostData[]>(PostState)
    const newPosts: PostData[] = []
    const [dropToggle, setDropToggle] = useState<string>('')

    // 불러온 마지막 데이터
    const [lastFetchedAt, setLastFetchedAt] = useState<Timestamp | null>(null); // 마지막으로 문서 가져온 시간

    // 공지사항 스테이트
    const setNewNotice = useSetRecoilState<boolean>(newNoticeState);
    const setNoticeLists = useSetRecoilState<noticeType[]>(noticeList);
    const postStyle = useState<boolean>(true)

    // 스토리지 기본 값 설정 용
    const setStorageLoad = useSetRecoilState<boolean>(storageLoadState);

    // 현재 로그인 한 유저
    const currentUser = useRecoilValue<userData>(userState)

    const ADMIN = useRecoilValue(ADMIN_ID);
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

    // state
    const router = useRouter();
    const pathName = usePathname();
    const observerLoadRef = useRef(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 웹소켓 연결
    const socketRef = useRef<Socket | null>(null);
    const uid = currentUser.uid
    useEffect(() => {
        // 설정 해주지 않으면 popstate 이벤트가 실행 안됨.
        window.history.pushState(null, "", window.location.pathname);

        if (!yourLogin) {
            router.push('/login');
            setLoginToggle(true);
        }

        // socket 객체를 초기화
        socketRef.current = socket; // socket은 외부에서 가져온 웹소켓 인스턴스

        const sockets = socketRef.current;

        sockets.on("connect", () => {
            // console.log("WebSocket 연결 성공");
        });

        // 새 공지 수신
        sockets.on("new-notice", () => {
            // console.log("새 공지 알림:", data);
            setNewNotice(true);
        });

        // 새 알림 수신
        sockets.on("initial-notices", (data) => {
            // console.log("새 알림:", data);
            setNoticeLists(data);
        });

        // 포스팅 저장된 내용 확인. 있어야 이미지 불러와짐
        const savedData = JSON.parse(localStorage.getItem('unsavedPost')!);

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

            if (!currentUser.uid) return console.log('유저 없음');
        }
    }, [currentUser])

    // 무한 스크롤 로직
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isError,  // 에러 상태
        error,    // 에러 메시지
    } = useInfiniteQuery({
        retry: false, // 재시도 방지
        queryKey: ['posts'],
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
            return fetchPosts(uid, pageParam, 5);
        },
        getNextPageParam: (lastPage) => {
            // 사용량 초과 시 페이지 요청 중단
            if (!lastPage.nextPage) return undefined;

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

        // 빈 배열이거나 데이터가 없으면 기존 데이터를 유지
        const fetchedPosts = data?.pages?.flatMap((page) => page?.data || []) || [];
        if (fetchedPosts.length === 0 && newPosts.length === 0) return;

        const uniquePosts = Array.from(
            new Map(
                [
                    ...posts, // fetchNewPosts로 가져온 최신 데이터
                    ...(data.pages
                        ?.flatMap((page) => page?.data || [])
                        .filter((post): post is PostData => !!post) || []),
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );

        // posts 배열이 업데이트될 때만 상태 변경
        if (JSON.stringify(uniquePosts) !== JSON.stringify(posts)) {
            setPosts(uniquePosts);
        }
    }, [newPosts, data.pages, usageLimit]);

    useEffect(() => {
        if (isError) {
            console.log('사용 제한!', error.message)
            if (error.message === '사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.') {
                setUsageLimit(true);
            }
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
    }, [hasNextPage, fetchNextPage, yourLogin])

    // 포스트 삭제
    const deletePost = async (postId: string) => {
        if (!yourLogin || usageLimit) {
            if (usageLimit) {
                return setLimitToggle(true);
            }
            if (!yourLogin) {
                setLoginToggle(true);
                setModal(true);
                return;
            }
        }

        const currentUserId = currentUser?.uid;

        try {
            // 게시글 존재 확인
            const postDoc = await getDoc(doc(db, 'posts', postId));
            if (!postDoc.exists()) {
                alert('해당 게시글을 찾을 수 없습니다.')
                return;
            }

            const postOwnerId = postDoc.data()?.userId;

            // 삭제 권한 확인
            if (currentUserId === postOwnerId || currentUserId === ADMIN) {
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

    // 포스트 보기
    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        if (!yourLogin || usageLimit) {
            if (usageLimit) {
                return setLimitToggle(true);
            }
            if (!yourLogin) {
                setLoginToggle(true);
                setModal(true);
                return;
            }
        }
        router.push(`memo/${postId}`)
    }

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

    useEffect(() => {
        if (posts) {
            let lastPost = null

            lastPost = posts[0]?.createAt
            setLastFetchedAt(lastPost)
        }
    }, [posts])

    // 새 문서 가져오기
    const fetchNewPosts = async () => {
        try {
            const postsRef = collection(db, "posts");

            const postsQuery = query(
                postsRef,
                where('notice', '==', false),
                orderBy('createAt', 'asc'),
                startAfter(lastFetchedAt) // 마지막 시간 이후
            );

            console.log(lastFetchedAt, '마지막 포스트 시간')
            const querySnapshot = await getDocs(postsQuery);

            const userCache = new Map<string, { nickname: string; photo: string | null }>();

            const newPostlist = await Promise.all(
                querySnapshot.docs.map(async (docs) => {
                    const postData = { id: docs.id, ...docs.data() } as PostData;

                    // 유저 정보 캐싱 및 가져오기
                    if (!userCache.has(postData.userId)) {
                        const userDocRef = doc(db, "users", postData.userId);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data() as { displayName: string; photoURL: string | null };
                            userCache.set(postData.userId, {
                                nickname: userData.displayName,
                                photo: userData.photoURL || null,
                            });
                        } else {
                            userCache.set(postData.userId, {
                                nickname: "Unknown",
                                photo: null,
                            });
                        }
                    }

                    // 매핑된 유저 정보 추가
                    const userData = userCache.get(postData.userId) || { nickname: "Unknown", photo: null };
                    postData.displayName = userData.nickname;
                    postData.PhotoURL = userData.photo;

                    return postData;
                })
            );

            if (newPostlist.length > 0) {
                const updatedPosts = [...newPostlist].sort((a, b) => {
                    const dateA = a.createAt.toMillis(); // Timestamp에서 밀리초로 변환
                    const dateB = b.createAt.toMillis(); // Timestamp에서 밀리초로 변환
                    return dateB - dateA; // 최신순으로 정렬
                });
                setPosts([...updatedPosts, ...posts]);
            }

            // 업데이트 플래그 초기화
            clearUpdate();
        } catch (error) {
            console.error("Error fetching new posts:", error);
        }
    };

    // 버튼 클릭 시 새 데이터 로드
    const handleUpdateClick = () => {
        fetchNewPosts();
    };

    const { hasUpdate, clearUpdate } = usePostUpdateChecker();

    // 페이지 이동 시 스크롤 위치 저장
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

    // 외부 클릭 감지 로직
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) // 클릭된 위치가 드롭다운 내부가 아닌 경우
            ) {
                setDropToggle(''); // 드롭다운 닫기
            }
        };

        document.addEventListener('mousedown', handleOutsideClick); // 이벤트 리스너 추가
        return () => document.removeEventListener('mousedown', handleOutsideClick); // 클린업
    }, []);
    return (
        <>
            {hasUpdate &&
                <NewPostBtn className='new_post_btn' onClick={handleUpdateClick}>새로운 업데이트 확인</NewPostBtn>
            }
            {/* 공지사항 제외 전체 포스트 */}
            <PostWrap postStyle>
                <>
                    {/* 무한 스크롤 구조 */}
                    {posts.map((post) => (
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
                                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); setDropToggle((prev) => (prev === post.id ? '' : post.id)); }}
                                >
                                    {dropToggle === post.id &&
                                        <div ref={dropdownRef}>
                                            <ul>
                                                <li className='post_drop_menu'>
                                                    <button onClick={(event) => { event.preventDefault(); deletePost(post.id); }} className='post_dlt_btn'>게시글 삭제</button>
                                                </li>
                                            </ul>
                                        </div>
                                    }
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
                    {postStyle && < div ref={observerLoadRef} style={{ height: '1px' }} />}
                    {
                        !hasNextPage &&
                        <NoMorePost>
                            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                            <p>모두 확인했습니다.</p>
                            <span>전체 메모를 전부 확인했습니다.</span>
                        </NoMorePost>
                    }
                </>
            </PostWrap >
        </>
    )
}