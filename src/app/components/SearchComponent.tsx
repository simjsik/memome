/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useState } from "react";
import { PostData } from "../state/PostState";
import { TitleHeader } from "../styled/PostComponents";
import { searchPosts } from "../api/loadToFirebasePostData/fetchPostData";
import { collection, getCountFromServer, query, Timestamp, where } from "firebase/firestore";
import { db } from "../DB/firebaseConfig";
import { Hits, InstantSearch, Pagination, SearchBox } from "react-instantsearch";
import { searchClient } from "../api/Algolia";

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
    top: 50%;
    transform: translate(-50%, -50%);
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

        input{
        width: 100%;
        height: 100%;
        padding-left: 46px;
        line-height: 42px;
        border: 1px solid #ededed;
        border-radius: 8px;
        font-size : 16px;
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
            flex: 0 0 60%;
            margin-right: 4px;

                .result_img_icon{
                width: 16px;
                height: 16px;
                margin: 6px 4px 0px;
                background: red;
                }

                .result_title{
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
            flex: 0 0 20%;
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

export default function SearchComponent() {
    const [searchText, setSearchText] = useState<string>('')
    const [searchOption, setSearchOption] = useState<string>('userId')
    const [optionToggle, setOptionToggle] = useState<boolean>(false)
    const [searchResult, setSearchResult] = useState<PostData[]>([])
    const [postLength, setPostLength] = useState<[number, number]>([0, 0]);
    const [searchLastParams, setSearchLastParams] = useState<[boolean, Timestamp] | null>(null);


    // state

    const handleSearchChange = (search: string) => {
        setSearchText(search)
    }

    const handleOptionChange = (option: string) => {
        setSearchOption(option)
    }

    // 포스트 스타일, 공지사항 값 별 포스트 길이 함수
    const getTotalPost = async (search: string, option: string) => {
        const totalPost = await getCountFromServer(query(collection(db, 'posts'), where(option, '==', search)));
        const totalPostLength = totalPost.data().count; // 전체 포스트 수
        const totalPages = Math.ceil(totalPostLength / 5); // 페이지당 5개 기준

        setPostLength([totalPages, totalPostLength])
    }

    // 페이지네이션 로직
    const handleClickPagenation = async (page: number) => {

        const pageSize = 10 * page;

        if ((searchResult.length >= pageSize || searchResult.length >= postLength[1]))
            return console.log('함수 요청 안함.');

        const newPosts = await searchPosts(searchLastParams, pageSize, searchResult.length, searchOption, searchText);

        setSearchResult((prevPosts) => [...prevPosts, ...newPosts?.data as PostData[]]); // 기존 데이터에 추가
        setSearchLastParams(newPosts?.nextPage as any); // 다음 페이지 정보 업데이트
    }


    // functon
    return (
        <SearchWrap>
            <div className="search_box">
                <h2>메모 검색</h2>
                <div className="search_bar">
                    <div className="search_input_wrap">
                        <div className="search_img"></div>
                        <input type="text" value={searchText} onChange={(e) => handleSearchChange(e.target.value)} />
                        <InstantSearch searchClient={searchClient} indexName="post_index">
                            <h2>검색</h2>
                            <SearchBox translations={{ placeholder: "검색어를 입력하세요" }} />
                            <Hits hitComponent={Hit} />
                            <Pagination />
                        </InstantSearch>
                    </div>
                    <div className="search_option_wrap">
                        <button onClick={() => setOptionToggle((prev) => !prev)} className="search_option_toggle_btn" css={optionToggle ? css`border-radius : 8px 8px 0px 0px` : css`border-radius : 8px`}>
                            {searchOption === 'userId' ?
                                '작성자'
                                :
                                searchOption === 'title' ?
                                    '제목'
                                    :
                                    '글내용'
                            }
                        </button>
                        {optionToggle &&
                            <div className="search_option">
                                <button data-search-value="userId">작성자</button>
                                <button data-search-value="title">제목</button>
                                <button data-search-value="content">글내용</button>
                            </div>
                        }
                    </div>
                    <button className="search_btn">검색</button>
                </div>
                <TitleHeader>
                    <div className='post_header'>
                        <p className='h_title'>제목</p>
                        <p className='h_user'>작성자</p>
                        <p className='h_date'>날짜</p>
                    </div>
                </TitleHeader>
                <div className="search_result_wrap">
                    <div className="search_result">
                        <div className="result_post_title">
                            <div className="result_img_icon"></div>
                            <p className="result_title">검색결과 제목입니다람쥐렁이</p>
                            <span className="result_comment">[+999]</span>
                        </div>
                        <p className="result_user">작성자입니다리우스웨인</p>
                        <p className="result_date">2024.12.31</p>
                    </div>
                </div>
                {/* 페이지네이션 버튼 */}
                {/* <div className='pagination_btn_wrap'>
                    {Array.from({ length: resultLength }, (_, index) => (
                        <button key={index} onClick={() => { handleClickPagenation(index + 1); swiperRef.current?.slideTo(index, 0); }}>
                            {index + 1}
                        </button>
                    ))}
                </div> */}
            </div>
        </SearchWrap>
    )
}

function Hit({ hit }: any) {
    return (
        <div>
            <p>{hit.title}</p>
        </div>
    );
}