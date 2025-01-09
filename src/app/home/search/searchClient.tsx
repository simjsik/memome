/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { searchClient } from "@/app/api/algolia";
import { useSearchParams } from "next/navigation";
import { InfiniteHits, InstantSearch, SearchBox, useHits, useInfiniteHits, useSearchBox } from "react-instantsearch";
import { SearchBoxWrap } from "./SearchStyle";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";


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
// Hit 컴포넌트 정의

function CustomInfiniteHits() {
    const { query } = useSearchBox(); // 검색어 상태 가져오기
    const { items, showMore, isLastPage } = useInfiniteHits();

    // 검색어가 없을 때
    if (!query.trim()) {
        return <p className="no_query_message">검색어를 입력해주세요</p>;
    }

    // 검색 결과가 없을 때
    if (items.length === 0) {
        return <p className="no_results_message">검색 결과가 없습니다</p>;
    }

    return (
        <div className="ais_infinite_result_wrap">
            <ul>
                {items.map((hit) => (
                    <PostHit key={hit.objectID} hit={hit} />
                ))}
            </ul>
            {!isLastPage && (
                <button onClick={showMore}>Show More</button>
            )}
        </div>
    );
}

function PostHit({ hit }: { hit: any }) {
    const [userData, setUserData] = useState<{ displayName: string; photoURL: string | null } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            }
        };

        fetchUserData();
    }, [hit.userId]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!userData) {
        return <p>User not found</p>;
    }

    return (
        <li className="ais_result_wrap">
            <div className="ais_profile_wrap">
                <div
                    className="ais_user_photo"
                    style={{ backgroundImage: `url(${userData.photoURL})` }}
                ></div>
                <p className="ais_user_name">{userData.displayName} · {formatDate(hit.createAt)}</p>
            </div>
            <div className="ais_post_content_wrap">
                <h2 className="ais_post_title">{hit.title}</h2>
                <div className="ais_post_content" dangerouslySetInnerHTML={{ __html: hit.content }}></div>
                <div className="ais_post_image_wrap">
                    {hit.images &&
                        hit.images.map((image: string, index: number) => (
                            <div
                                className="ais_post_images"
                                key={index}
                                style={{ backgroundImage: `url(${image})` }}
                            ></div>
                        ))}
                </div>
                <div className="ais_post_comment_wrap">
                    <div className="comment_icon"></div>
                    <p className="ais_comment_count">{hit.commentCount}</p>
                </div>
            </div>
        </li>
    );
}


const CustomSearch = () => {
    const { refine } = useSearchBox(); // Algolia 검색 상태를 업데이트하는 함수
    const searchParams = useSearchParams();
    const query = searchParams?.get('query') || '';
    const router = useRouter();

    const handleSearch = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // 엔터키를 감지
        if (event.key === 'Enter') {
            const inputElement = event.target as HTMLInputElement;

            // input 요소에서 검색어를 가져옴
            const query = inputElement.value.trim();

            if (query) {
                // 검색어가 비어있지 않다면 'home/search'로 이동
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
        <SearchBox defaultValue={query} searchAsYouType={false} onKeyDown={(event) => handleSearch(event)} />
    );
};

export default function SearchClient() {
    const searchParams = useSearchParams();
    const query = searchParams?.get('query') || '';

    useEffect(() => {
        console.log(query)
    }, [])
    return (
        <InstantSearch searchClient={searchClient} indexName="post_index">
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
        </InstantSearch>
    )
}