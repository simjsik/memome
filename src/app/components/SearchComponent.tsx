/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from "@emotion/styled";
import { Configure, Index, InstantSearch, Pagination, SearchBox, useHits, useSearchBox } from "react-instantsearch";
import { Hits } from 'react-instantsearch';
import { searchClient } from "../api/algolia";
import { TitleHeader } from "../styled/PostComponents";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { searchState } from "../state/PostState";

// 검색 창 css
const SearchWrap = styled.div`
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.8);
z-index: 1;

    // 메모 검색
    h2{
    flex: 1 0 100%;
    font-size: 20px;
    font-weight: normal;
    font-family: var(--font-pretendard-bold);
    }
    // --------------------------------------------------------

    // 검색 박스
    .search_box{
    position: absolute;
    left: 50%;
    top: 40px;
    transform: translateX(-50%);
    display: flex;
    flex-wrap: wrap;
    width: 600px;
    height: fit-content;
    padding : 8px;
    background: #fff;
    border: 1px solid #ededed;
    border-radius: 16px;
    }

    .search_bar{
    flex: 1 0 100%;
    display: flex;
    height: 42px;
    margin-top : 8px;
    }
    // -----------------------------------------------------------------------

    // 검색 창
    .search_input_wrap{
    flex: 0 0 65%;
    height : 42px;
    margin-right : 4px;

        .search_img{
        position: absolute;
        width: 32px;
        height: 32px;
        background: red;
        margin: 5px 10px;
        }

        .ais-SearchBox-input{
        width: 100%;
        height: 42px;
        padding-left: 46px;
        line-height: 42px;
        border: 1px solid #ededed;
        border-radius: 8px;
        font-size : 16px;
        }
        .ais-SearchBox-submit,
        .ais-SearchBox-reset{
        display : none;
        }
    }
    // ----------------------------------------------------------------------

    // 검색 옵션
    .search_option_wrap{
        margin-right : 4px;
        width : 100px;
        height : fit-content;
        border-radius: 8px;

        .search_option{
        width: 100%;
        height : fit-content;
        display: flex;
        flex-wrap: wrap;

            button {
            flex: 1 0 100%;
            height: 42px;
            font-size: 14px;
            border: 1px solid #ededed;
            background: #fff;
            cursor:pointer;
            }

            button{
            flex: 1 0 100%;
            height: 42px;
            font-size: 14px;
            border-top : none;
            background: #fff;
            }

            button:last-child{
            border-radius: 0px 0px 8px 8px;
            }
        }

        .search_option_toggle_btn{
        width: 100px;
        height: 42px;
        font-size: 14px;
        border: 1px solid #ededed;
        background: #fff;
        cursor:pointer;
        }
    }
    // -------------------------------------------------

    .search_btn{
    flex : 1 0 0%;
    height: 42px;
    background: #212121;
    border: none;
    border-radius: 8px;
    color: #fff;
    }

    // 검색결과
    .search_result_wrap{
    flex: 1 0 100%;
    margin-top : 10px;

        // 검색된 포스터
        .search_result{
        display: flex;
        width: 100%;
        height: 42px;
        padding : 8px;

            // 포스터 제목란
            .result_post_title{
            display: flex;
            flex: 0 0 54%;
            margin-right: 4px;

                .result_img_icon{
                width: 16px;
                height: 16px;
                margin: 6px 4px 0px;
                background: red;
                }

                .result_tag{
                font-size : 14px;
                line-height: 26px;
                color : #333;
                margin-right : 4px;
                }

                .result_title{
                max-width : 60%;
                margin-right: 4px;
                font-size: 14px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                line-height: 26px;
                }

                .result_comment{
                color: #f12014;
                font-size: 14px;
                font-family: var(--font-pretendard-bold);
                line-height: 26px;
                }
            }
            
            // 유저
            .result_user{
            flex: 0 0 18%;
            font-size: 14px;
            margin-right: 4px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            line-height: 26px;
            }

            // 작성일
            .result_date{
            flex: 0 0 20%;
            font-size: 14px;
            line-height: 26px;
            }
        }
    }
    // ---------------------------------------------------
`
function formatDate(createAt: any) {
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

const UserHitComponent = ({ hit }: { hit: { displayName: string; photoURL: string } }) => (
    <div className="search_result_wrap">
        <div className="search_result">
            <div
                className="result_user_photo"
                style={{
                    width: '24px',
                    height: '24px',
                    backgroundImage: `url(${hit.photoURL})`,
                }}
            ></div>
            <h2 className="result_name">{hit.displayName}</h2>
        </div>
    </div>
);



// 검색 결과 및 검색어 상태 처리
const SearchResults = () => {
    const { query, refine } = useSearchBox(); // 검색어 가져오기
    const { items } = useHits(); // 검색 결과 가져오기

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


    // 검색어가 비어 있는 경우
    if (!debouncedQuery.trim()) {
        return <p>검색어를 입력해주세요</p>;
    }

    // 로딩 중 상태 표시
    if (searchLoading) {
        return <p>Loading...</p>; // 로딩 텍스트나 스피너
    }

    // 검색 결과가 없는 경우
    if (debouncedQuery && items.length === 0) {
        return <p>검색결과가 없습니다.</p>;
    }

    const PostHitComponent = ({ hit }: { hit: { title: string; tag: string; commentCount: number; createAt: string } }) => (
        <div className="search_result_wrap">
            <div className="search_result" >
                <div className="result_post_title">
                    <div className="result_img_icon"></div>
                    <p className="result_title">{hit.title}</p>
                    <span className="result_comment">[{hit.commentCount}]</span>
                </div>
                <p className="result_user">유저명</p>
                <p className="result_date">{formatDate(hit.createAt)}</p>
            </div >
        </div>
    );

    return (
        <>
            {items.map((hit: any, index: number) => (
                <PostHitComponent key={index} hit={hit} />
            ))}
            <Pagination />
            <Configure hitsPerPage={5} />
        </>
    )
};

export default function SearchComponent() {
    const [searchToggle, setSearchToggle] = useRecoilState<boolean>(searchState)
    // state
    // functon
    return (
        <SearchWrap>
            <button onClick={() => setSearchToggle(false)}>X</button>
            <InstantSearch searchClient={searchClient} indexName="post_index">
                <div className="search_box">
                    <h2>메모 검색</h2>
                    <div className="search_bar">
                        <div className="search_input_wrap">
                            <div className="search_img"></div>
                            <SearchBox />
                        </div>
                        <button className="search_btn">검색</button>
                    </div>

                    {/* 유저 검색 결과 */}
                    <Index indexName="user_index">
                        <p>작성자 검색 결과</p>
                        <Hits hitComponent={UserHitComponent} />
                        <Pagination />
                    </Index>

                    {/* 게시글 결과 */}
                    <p>게시글 검색 결과</p>
                    <TitleHeader>
                        <div className='post_header'>
                            <p className='h_title'>제목</p>
                            <p className='h_user'>작성자</p>
                            <p className='h_date'>날짜</p>
                        </div>
                    </TitleHeader>
                    <SearchResults />
                </div>
            </InstantSearch>
        </SearchWrap>
    )
}
