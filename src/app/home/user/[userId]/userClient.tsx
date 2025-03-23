/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { ADMIN_ID, ImagePostData, loadingState, PostData, UsageLimitState, userData } from "@/app/state/PostState";
import { css } from "@emotion/react";
import { motion } from "framer-motion";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UserPostWrap } from "./userStyle";
import { auth, db } from "@/app/DB/firebaseConfig";
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { NoMorePost } from "@/app/styled/PostComponents";
import { fetchPostList } from "@/app/utils/fetchPostData";
import LoadingWrap from "@/app/components/LoadingWrap";
import { btnVariants } from "@/app/styled/motionVariant";


interface ClientUserProps {
    user: userData,
}

interface FetchPostListResponse {
    data: PostData[];
    imageData: ImagePostData[];
    nextPage: Timestamp | undefined;
}
export default function UserClient({ user }: ClientUserProps) {
    const [imagePost, setImagePost] = useState<ImagePostData[]>([])
    const ADMIN = useRecoilValue(ADMIN_ID);
    const router = useRouter();
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const [posts, setPosts] = useState<PostData[]>([])
    const [postTab, setPostTab] = useState<boolean>(true)
    const [dropToggle, setDropToggle] = useState<string>('')
    const [loading, setLoading] = useRecoilState(loadingState);
    const [dataLoading, setDataLoading] = useState<boolean>(false);


    const dropdownRef = useRef<HTMLDivElement>(null);
    const observerLoadRef = useRef(null);
    const observerImageLoadRef = useRef(null);

    const uid = user.uid

    // 무한 스크롤 로직
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
    } = useInfiniteQuery<
        FetchPostListResponse,
        Error,
        InfiniteData<{ data: PostData[]; imageData: ImagePostData[]; nextPage: Timestamp | undefined }>,
        string[], // TQueryKey
        Timestamp | undefined // TPageParam
    >({
        retry: false,
        queryKey: ['postList', uid],
        queryFn: async ({ pageParam }) => {
            try {
                setDataLoading(true)

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

                return fetchPostList(uid, pageParam, 4);
            } catch (error) {
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    throw error;
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            } finally {
                setDataLoading(false)
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
        initialPageParam: undefined,
    });

    // 무한 스크롤 로직의 data가 변할때 마다 posts 배열 업데이트
    useEffect(() => {
        const uniquePosts = Array.from(
            new Map(
                [
                    ...(data?.pages
                        ?.flatMap((page) => page?.data || [])
                        .filter((post): post is PostData => !!post) || []),
                ].map((post) => [post.id, post]) // 중복 제거를 위해 Map으로 변환
            ).values()
        );

        const uniqueImagePosts = Array.from(
            new Map(
                [
                    ...(data?.pages
                        ?.flatMap((page) => page?.imageData || [])
                        .filter((post): post is ImagePostData => !!post) || []),
                ].map((post) => [post.id, post])
            ).values()
        );

        setImagePost(uniqueImagePosts);
        setPosts(uniquePosts); // 중복 제거된 포스트 배열을 posts에 저장
    }, [data?.pages]);

    // 스크롤 끝나면 포스트 요청
    const isFirstLoad = useRef(true); // 최초 실행 여부 확인

    useEffect(() => {
        if (usageLimit || !postTab) return; // postTab === false면 실행 안 함.

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    if (isFirstLoad.current) {
                        isFirstLoad.current = false; // 최초 실행을 방지하고 이후부터 동작
                        return;
                    }
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerLoadRef.current) {
            observer.observe(observerLoadRef.current);
        }

        return () => {
            if (observerLoadRef.current) {
                observer.unobserve(observerLoadRef.current); // 기존 observer 해제
            }
            observer.disconnect(); // 강제 해제
        };
    }, [hasNextPage, fetchNextPage, usageLimit, postTab])

    useEffect(() => {
        if (usageLimit || postTab) return; // postTab === true면 실행 안 함.

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    if (entries[0].isIntersecting && hasNextPage) {
                        if (isFirstLoad.current) {
                            isFirstLoad.current = false; // 최초 실행을 방지하고 이후부터 동작
                            return;
                        }
                        fetchNextPage();
                    }
                }
            },
            { threshold: 1.0 }
        );

        if (observerImageLoadRef.current) {
            observer.observe(observerImageLoadRef.current);
        }

        return () => {
            if (observerImageLoadRef.current) {
                observer.unobserve(observerImageLoadRef.current); // 기존 observer 해제
            }
            observer.disconnect(); // 강제 해제
        };
    }, [hasNextPage, fetchNextPage, usageLimit, postTab]);

    // 초기 데이터 로딩
    useEffect(() => {
        if (!isLoading) {
            setLoading(false); // 초기 로딩 해제
        }
    }, [isLoading, setLoading])

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

    const handleClickPost = (userId: string) => {
        router.push(`/home/memo/${userId}`)
    }

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
            <UserPostWrap>
                <div className="user_tab_wrap">
                    <button className="memo_tab" onClick={() => setPostTab(true)}>메모</button>
                    <button className="image_tab" onClick={() => setPostTab(false)}>이미지</button>
                </div>
                {postTab ?
                    <>
                        {!loading && posts.map((post) => (
                            <motion.div key={post.id} className="user_post_list_wrap"
                                whileHover={{
                                    backgroundColor: "#fafbfc",
                                    transition: { duration: 0.1 },
                                }}
                            >
                                <div className="user_post_top">
                                    <div className="user_post_photo"
                                        css={css`background-image : url(${user.photo})`}
                                    ></div>
                                    <div className="user_post_name">
                                        <p>{user.name}</p>
                                        <span>@{user.uid.slice(0, 6)}... · {formatDate(post.createAt)}</span>
                                    </div>
                                    <div className="post_more">
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
                                </div>
                                <div className="user_post_title_wrap">
                                    <span className="user_post_tag">[{post.tag}]</span>
                                    <p className="user_post_title" onClick={() => handleClickPost(post.id)}>{post.title}</p>
                                </div>
                                <div className="user_post_content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                                {(post.images && post.images.length > 0) && (
                                    <div className="user_post_img">
                                        {post.images.map((imageUrl, index) => (
                                            <div key={index} css={css`
                                        background-image : url(${imageUrl})
                                        `}></div>
                                        ))}
                                    </div>
                                )}
                                <div className="user_post_bottom">
                                    <div className="user_post_comment">
                                        <button className='post_comment_btn'>
                                            <motion.div
                                                variants={btnVariants}
                                                whileHover="iconHover"
                                                whileTap="iconClick" className="user_post_comment_icon">
                                            </motion.div>
                                        </button>
                                        <p>
                                            {post.commentCount}
                                        </p>
                                    </div>
                                    <BookmarkBtn postId={post.id}></BookmarkBtn>
                                </div>
                            </motion.div>
                        ))}
                        {postTab && <div className="postObserver" ref={observerLoadRef} style={{ height: '1px', visibility: dataLoading ? "hidden" : "visible" }} />}
                        {(!loading && dataLoading) && <LoadingWrap />}
                        {
                            (!hasNextPage && posts.length > 0 && !loading) &&
                            <NoMorePost>
                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                                <p>모두 확인했습니다.</p>
                                <span>전체 메모를 전부 확인했습니다.</span>
                            </NoMorePost>
                        }
                        {
                            (posts.length === 0 && !loading) &&
                            < NoMorePost >
                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                                <p>메모가 없습니다.</p>
                                <span>새 메모를 작성 해보세요.</span>
                            </NoMorePost>
                        }
                    </>
                    :
                    <>
                        <div className="user_image_post_wrap">
                            {!loading && imagePost.map((post) => (
                                post.images &&
                                <motion.div key={post.id} className="user_image_wrap"
                                    whileHover={{
                                        backgroundColor: "#f5f5f5",
                                    }}
                                >
                                    {post.images.length > 0 && (
                                        <>
                                            {post.images.map((imageUrl, index) => (
                                                <div key={index} className="image_post_img" css={css`
                                            background-image : url(${imageUrl})
                                            `}>
                                                </div>
                                            ))}
                                            < div className="image_list_icon"></div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        {!postTab && <div className="imageObserver" ref={observerImageLoadRef} style={{ height: '1px', visibility: dataLoading ? "hidden" : "visible" }} />}
                        {(!loading && dataLoading) && <LoadingWrap />}
                        {
                            (!hasNextPage && imagePost.length > 0 && !loading) &&
                            <NoMorePost>
                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                                <p>모두 확인했습니다.</p>
                                <span>이미지가 포함된 메모를 전부 확인했습니다.</span>
                            </NoMorePost>
                        }
                        {
                            (imagePost.length === 0 && !loading) &&
                            <NoMorePost>
                                <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449439/%ED%8F%AC%EC%8A%A4%ED%8A%B8%EB%8B%A4%EB%B4%A4%EB%8B%B9_td0cvj.svg)`}></div>
                                <p>메모가 없습니다.</p>
                                <span>메모 작성 시 이미지를 추가 해보세요.</span>
                            </NoMorePost>
                        }
                    </>
                }
            </UserPostWrap >
        </>
    )
}
