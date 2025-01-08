/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { searchClient } from "@/app/api/algolia";
import { useSearchParams } from "next/navigation";
import { InfiniteHits, InstantSearch, SearchBox, useHits, useSearchBox } from "react-instantsearch";
import { SearchBoxWrap } from "./SearchStyle";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";


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
const CustomHit = () => {
    const { query, refine } = useSearchBox();
    const { items } = useHits();
    // 검색 결과 대기
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [searchLoading, setSearchLoading] = useState(false); // 로딩 상태 추가

    useEffect(() => {
        if (query.trim()) {
            setSearchLoading(true);
        } else {
            setDebouncedQuery('');
            setSearchLoading(false);
        }

        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            refine(query);
            setSearchLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, refine])

    if (!query) return <p>작성자 및 키워드를 입력해 검색해 보세요.</p>

    if (searchLoading) {
        return;
    }

    // 검색어가 비어 있는 경우
    if (!debouncedQuery.trim()) {
        return <p>작성자 및 키워드를 입력해 검색해 보세요.</p>;
    }
    const PostHitComponent = ({ hit }: { hit: any }) => (
        <div className="ais_result_wrap">
            <div className="ais_profile_wrap">
                <div className="ais_user_photo" css={css`background-image : url(hit.photoUrl)`}></div>
                <p className="ais_user_name">유저네임매핑하자 · {formatDate(hit.createAt)}</p>
            </div>
            <h2 className="ais_post_title">{hit.title}</h2>
            <div className="ais_post_content_wrap" dangerouslySetInnerHTML={{ __html: hit.content }}></div>
            <div className="ais_post_image_wrap">
                {hit.images &&
                    hit.images.map((image: string, index: number) => (
                        <div key={index} css={css`background-image : url(${image})`}></div>
                    ))
                }
            </div>
            <div className="ais_post_comment_wrap">
                <div className="comment_icon"></div>
                <p className="ais_comment_count">{hit.commentCount}</p>
            </div>
        </div>
    );


    return (
        <>
            {
                items.map((hit: any, index: number) => (
                    <div key={index}>
                        <PostHitComponent hit={hit} />
                    </div>
                ))
            }
        </>
    )
}

export default function SearchClient() {
    const searchParams = useSearchParams();
    const query = searchParams?.get('query') || '';

    return (
        <InstantSearch searchClient={searchClient} indexName="post_index">
            <SearchBoxWrap>
                <div className="search_bar">
                    <div className="search_input_wrap">
                        <SearchBox
                            defaultValue={query}
                            searchAsYouType={false}
                        />
                        <InfiniteHits hitComponent={CustomHit} />
                    </div>
                </div>
                <div className="post_result">
                </div>
            </SearchBoxWrap>
        </InstantSearch>
    )
}