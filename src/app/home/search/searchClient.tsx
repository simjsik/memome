/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import Image from 'next/image';
import { useSearchParams } from "next/navigation";
import { InstantSearch, SearchBox, useInfiniteHits, useSearchBox } from "react-instantsearch";
import { SearchBoxWrap } from "./SearchStyle";
import { css, useTheme } from "@emotion/react";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { NoMorePost, PostWrap } from "@/app/styled/PostComponents";
import { loadingState, PostData, statusState, UsageLimitState, UsageLimitToggle } from "@/app/state/PostState";
import { searchClient } from "@/app/utils/algolia";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { motion } from "framer-motion";
import { useHandleUsernameClick } from "@/app/utils/handleClick";
import { btnVariants } from "@/app/styled/motionVariant";
import { cleanHtml } from "@/app/utils/CleanHtml";
import LoadingWrap from "@/app/components/LoadingWrap";
import { useDelPost } from "../post/hook/useNewPostMutation";
import LoadLoading from "@/app/components/LoadLoading";
import { formatDate } from "@/app/utils/formatDate";

// Hit 컴포넌트 정의

function CustomInfiniteHits() {
    const { query } = useSearchBox(); // 검색어 상태 가져오기
    const { items, showMore, isLastPage } = useInfiniteHits<PostData>();

    // 검색어가 없을 때
    if (!query.trim()) {
        return <NoMorePost>
            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966539/%EA%B2%80%EC%83%89%ED%95%B4%EC%A4%98_r6cgmi.svg)`}></div>
            <p>검색어를 입력 해주세요.</p>
            <span>사용자나 아이디 또는 메모 제목을 검색 해보세요.</span>
        </NoMorePost>;
    }

    // 검색 결과가 없을 때
    if (items.length === 0) {
        return <NoMorePost>
            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966539/%EA%B2%80%EC%83%89%EC%97%86%EC%96%B4_w1msj0.svg)`}></div>
            <p>&apos;{query}&apos;에 대한 검색결과 없음.</p>
            <span className="no_result_span">다른 용어를 검색해 보거나 검색어가 정확한지 확인해 보세요.</span>
        </NoMorePost>;
    }

    return (
        <div className="ais_infinite_result_wrap">
            {items.map((hit) => (
                <PostHit key={hit.objectID} hit={hit} />
            ))}
            {!isLastPage && (
                <button onClick={showMore}>더 보기</button>
            )}
        </div>
    );
}




function PostHit({ hit }: { hit: PostData }) {
    const theme = useTheme();
    const [userData, setUserData] = useState<{ displayName: string; photoURL: string | null } | null>(null);
    const [loading, setIsLoading] = useState<boolean>(true);
    const setLoading = useSetRecoilState<boolean>(loadingState);
    const usageLimit = useRecoilValue<boolean>(UsageLimitState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle);
    const [dropToggle, setDropToggle] = useState<string>('');
    const [routePostId, setRoutePostId] = useState<string | null>(null);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(collection(db, 'users'), hit.userId));
                if (userDoc.exists()) {
                    const user = userDoc.data() as { displayName: string; photoURL: string | null };
                    setUserData(user);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [hit.userId]);

    const handleUsernameClick = useHandleUsernameClick();

    const { mutate: handledeletePost } = useDelPost();
    // 포스트 삭제
    const deletePost = async (postId: string) => {
        const confirmed = confirm('게시글을 삭제 하시겠습니까?')
        if (!confirmed) return;
        handledeletePost(postId)
    }

    if (!userData) {
        return <p>User not found</p>;
    }

    return (
        <>
            {!loading &&
                <motion.div
                    whileHover="otherHover"
                    variants={btnVariants(theme)}
                    key={hit.objectID as string}
                    className='post_box'
                >
                    {routePostId === hit.objectID && <LoadLoading />}
                    {/* 작성자 프로필 */}
                    <div className='post_profile_wrap'>
                        <div className='user_profile'>
                            <div className='user_photo'
                                css={css`background-image : url(${userData.photoURL})`}
                            >
                            </div>
                            <p className='user_name'
                                onClick={(e) => { e.preventDefault(); handleUsernameClick(hit.userId); }}
                            >
                                {userData.displayName}
                            </p>
                            <span className='user_uid'>
                                @{hit.userId.slice(0, 6)}...
                            </span>
                            <time className='post_date'>
                                · {formatDate(hit.createAt)}
                            </time>
                        </div>
                        <div className='post_dropdown_wrap' ref={dropdownRef}>
                            <motion.button
                                variants={btnVariants(theme)}
                                whileHover="iconWrapHover"
                                whileTap="iconWrapClick"
                                className='post_drop_menu_btn'
                                aria-label='포스트 옵션 더보기'
                                css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736451404/%EB%B2%84%ED%8A%BC%EB%8D%94%EB%B3%B4%EA%B8%B0_obrxte.svg)`}
                                onClick={(event) => { event.preventDefault(); event.stopPropagation(); setDropToggle((prev) => (prev === hit.objectID as string ? '' : hit.objectID as string)); }}
                            >
                                {dropToggle === hit.objectID as string &&
                                    <div>
                                        <ul>
                                            <li className='post_drop_menu'>
                                                <motion.button
                                                    variants={btnVariants(theme)}
                                                    whileHover="otherHover"
                                                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); deletePost(hit.objectID as string); }} className='post_dlt_btn'>게시글 삭제</motion.button>
                                            </li>
                                        </ul>
                                    </div>
                                }
                            </motion.button>
                        </div>
                    </div>
                    {/* 포스트 내용 */}
                    <div className='post_content_wrap' onClick={(event) => { event.preventDefault(); handlePostClick(hit.objectID as string); }}>
                        {/* 포스트 제목 */}
                        < div className='post_title_wrap' >
                            {hit.notice ?
                                <>
                                    <span className='notice_tag'>{hit.tag}</span>
                                    <h2 className='notice_title'>{hit.title}</h2>
                                </>
                                :
                                <>
                                    <span className='post_tag'>[{hit.tag}]</span>
                                    <h2 className='post_title'>{hit.title}</h2>
                                </>
                            }
                        </div>
                        <div className='post_text' dangerouslySetInnerHTML={{ __html: cleanHtml(hit.content) }}></div>
                        {/* 이미지 */}
                        {hit.thumbnail && (
                            <div className='post_pr_img_wrap'>
                                <div className='post_pr_img'>
                                    <Image
                                        src={hit.thumbnail as string}
                                        alt="포스트 이미지"
                                        fill
                                        css={css`object-fit: cover`} />
                                    {hit.images &&
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
                                <p>{hit.commentCount}</p>
                            </div>
                            <BookmarkBtn postId={hit.objectID as string}></BookmarkBtn>
                        </div>
                    </div>
                </motion.div >
            }
            {loading && <LoadingWrap />}
        </>
    );
}


const CustomSearch = () => {
    const { refine } = useSearchBox(); // Algolia 검색 상태를 업데이트하는 함수
    const searchParams = useSearchParams();
    const query = searchParams?.get('query') || '';
    const router = useRouter();
    const setMobileStatus = useSetRecoilState<boolean>(statusState)

    const handleSearch = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // 엔터키를 감지
        if (event.key === 'Enter') {
            const inputElement = event.target as HTMLInputElement;

            // input 요소에서 검색어를 가져옴
            const query = inputElement.value.trim();

            if (query) {
                // 검색어가 비어있지 않다면 'home/search'로 이동
                setMobileStatus(false);
                router.push(`/home/search?query=${encodeURIComponent(query)}`);
            }
        }
    };

    useEffect(() => {
        if (query.trim() !== '') {
            refine(query); // 검색어가 있을 때만 refine 호출
        }
    }, [query, refine]);


    useEffect(() => {
        refine(query); // 검색어를 Algolia의 상태로 설정
    }, [query, refine]);

    return (
        <SearchBox placeholder="검색" defaultValue={query} searchAsYouType={false} onKeyDown={(event) => handleSearch(event)} />
    );
};

export default function SearchClient() {
    const setLoading = useSetRecoilState<boolean>(loadingState);

    useEffect(() => {
        setLoading(false)
    }, [])
    return (
        <InstantSearch searchClient={searchClient} indexName="post_index">
            <PostWrap>
                <SearchBoxWrap>
                    <div className="search_bar">
                        <div className="search_input_wrap">
                            <CustomSearch></CustomSearch>
                            <CustomInfiniteHits />
                        </div>
                    </div>
                    <div className="post_result">
                    </div>
                </SearchBoxWrap>
            </PostWrap>
        </InstantSearch>
    )
}