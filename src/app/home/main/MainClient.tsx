/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ADMIN_ID, newNoticeState, noticeList, noticeType, PostData, PostState, storageLoadState, UsageLimitState, userData, userState } from '../../state/PostState';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { PostWrap } from '../../styled/PostComponents';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, startAfter, Timestamp, where } from 'firebase/firestore';
import { auth, db } from '../../DB/firebaseConfig';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '../../api/loadToFirebasePostData/fetchPostData';

// Swiper
import { usePostUpdateChecker } from '@/app/hook/ClientPolling';
import socket from '@/app/api/websocket/route';
import { Socket } from 'socket.io-client';

const postDeleteBtn = css`
position : absolute;
right : 20px;
top: 50%;
transform: translateY(-50%);
width : 14px;
height : 14px;
background : red;
border : none;
cursor : pointer;
`
const PostStyleBtn = styled.button`
position : fixed;
left: 18px;
bottom: 20px;
width : 42px;
height : 42px;
background-repeat: no-repeat;
background-size: cover;
background-color : #fff;
border : 1px solid #ededed;
border-radius : 8px;
cursor : pointer;
`

interface MainHomeProps {
    post: PostData[],
    initialNextPage: any;
}

export default function MainHome({ post: initialPosts, initialNextPage }: MainHomeProps) {
    window.history.scrollRestoration = 'manual'

    // 포스트 스테이트
    const [posts, setPosts] = useRecoilState<PostData[]>(PostState)
    const [newPosts, setNewPosts] = useState<PostData[]>([])


    // 불러온 마지막 데이터
    const [lastFetchedAt, setLastFetchedAt] = useState(null); // 마지막으로 문서 가져온 시간

    // 공지사항 스테이트
    const [newNotice, setNewNotice] = useRecoilState<boolean>(newNoticeState);
    const [noticeLists, setNoticeLists] = useRecoilState<noticeType[]>(noticeList);
    const [postStyle, setPostStyle] = useState<boolean>(true)

    // 스토리지 기본 값 설정 용
    const [storageLoad, setStorageLoad] = useRecoilState<boolean>(storageLoadState);

    // 현재 로그인 한 유저
    const [currentUser, setCurrentUser] = useRecoilState<userData | null>(userState)

    const ADMIN = useRecoilValue(ADMIN_ID);
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    // state
    const router = useRouter();
    const pathName = usePathname();
    const observerLoadRef = useRef(null);

    // 웹소켓 연결
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // 설정 해주지 않으면 popstate 이벤트가 실행 안됨.
        window.history.pushState(null, "", window.location.pathname);

        // socket 객체를 초기화
        socketRef.current = socket; // socket은 외부에서 가져온 웹소켓 인스턴스

        const sockets = socketRef.current;

        sockets.on("connect", () => {
            // console.log("WebSocket 연결 성공");
        });

        // 새 공지 수신
        sockets.on("new-notice", (data) => {
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
        }
    }, [currentUser])

    // 무한 스크롤 로직
    const {
        data,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: async ({ pageParam }) => {
            try {
                console.log(pageParam.at(1), '보내는 시간')
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
        const uniquePosts = Array.from(
            new Map(
                [
                    ...posts, // fetchNewPosts로 가져온 최신 데이터
                    ...data.pages.flatMap((page) => page.data as PostData[]) // 무한 스크롤 데이터
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );

        setPosts(uniquePosts); // 중복 제거된 포스트 배열을 posts에 저장
    }, [newPosts, data.pages]);

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

    // 포스트 삭제
    const deletePost = async (postId: string) => {
        if (!auth.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        const currentUserId = auth.currentUser.uid;

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
        router.push(`memo/${postId}`)
    }

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
                    const dateA = a.createAt?.toDate ? a.createAt.toDate() : a.createAt;
                    const dateB = b.createAt?.toDate ? b.createAt.toDate() : b.createAt;
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
            {hasUpdate &&
                <button css={
                    css`
                    padding: 8px;
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1;
                    background: red;
                    color: #fff;
                    border: none;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    `} onClick={handleUpdateClick}>새로운 업데이트 확인
                </button>}
            {/* 공지사항 제외 전체 포스트 */}
            {!usageLimit &&
                <PostWrap postStyle={postStyle}>
                    <>
                        {/* 무한 스크롤 구조 */}
                        {posts.map((post) => (
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
                                        · {formatDate(post.createAt)}
                                    </p>
                                    <button className='post_drop_menu_btn'>
                                        <ul>
                                            <li className='post_drop_menu'>
                                                <button onClick={() => deletePost(post.id)} className='post_dlt_btn'>게시글 삭제</button>
                                            </li>
                                        </ul>
                                    </button>
                                </div>
                                {/* 포스트 제목 */}
                                <div className='post_title_wrap'>
                                    <span className='post_tag'>[{post.tag}]</span>
                                    <h2 className='post_title' onClick={() => handlePostClick(post.id)}>{post.title}</h2>
                                </div>
                                {/* 포스트 내용 */}
                                <div className='post_content_wrap'>
                                    <div className='post_text' dangerouslySetInnerHTML={{ __html: post.content }}></div>
                                    {/* 이미지 */}
                                    <div className='post_pr_img_wrap'>
                                        {(post.images && post.images.length > 0) && (
                                            post.images.map((imageUrl, index) => (
                                                <div className='post_pr_img' key={index}
                                                    css={css`
                                                            background-image : url(${imageUrl});
                                                            height : ${(post.images && post.images?.length === 1) ? '400px'
                                                            :
                                                            (post.images && post.images?.length === 2) ? '300px'
                                                                :
                                                                '140px'
                                                        };
                                                            `}></div>
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
                        {postStyle && < div ref={observerLoadRef} style={{ height: '1px' }} />}
                        {(!hasNextPage && postStyle) && <p>제일 최근 메모입니다.</p>}
                    </>
                    <PostStyleBtn className='post_style_btn' onClick={() => setPostStyle((prev) => !prev)} ></PostStyleBtn>
                </PostWrap>
            }
        </>
    )
}