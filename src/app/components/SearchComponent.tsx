/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from "@emotion/styled";
import { InstantSearch, SearchBox, useHits, useSearchBox } from "react-instantsearch";
import { searchClient } from "../api/algolia";
import { TitleHeader } from "../styled/PostComponents";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { searchState } from "../state/PostState";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Scrollbar } from 'swiper/modules';
import { useRouter } from "next/navigation";
// 검색 창 css
const SearchWrap = styled.div`
position: relative;


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
    top: 20px;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: fit-content;
    margin-top: 10px;
    background: #fff;
    }

    .search_close_btn{
    position: absolute;
    right: 10px;
    border: none;
    background: none;
    width: 24px;
    height: 24px;

        polyline{
            fill: none;
        }

        line {
            width: 24px;
            height: 24px;
            stroke : #272D2D;
            stroke-width : 2px;
            stroke-linecap: round;
        }
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
    width : 100%;
    height : 42px;
    margin-right : 4px;

        .search_img{
        position: absolute;
        width: 32px;
        height: 32px;
        background: red;
        margin: 5px 10px;
        z-index : 1;
        }
        .ais-SearchBox-form{
        position : relative;
        }
        .ais-SearchBox-input{
        width: 100%;
        height: 42px;
        padding: 0px 10px 0px 46px;
        line-height: 42px;
        border: 1px solid #ededed;
        border-radius: 8px;
        font-size : 16px;

            &:focus {
            outline : 1px solid #272D2D;
            }
        }

        .ais-SearchBox-input::-webkit-search-decoration,
        .ais-SearchBox-input::-webkit-search-results-button,
        .ais-SearchBox-input::-webkit-search-results-decoration {
            display: none; /* 기본 리셋 버튼 숨기기 */
        }

        .ais-SearchBox-submit{
            width: 42px;
            height: 42px;
            position: absolute;
            left: 0;
            border: none;
            background: none;

            svg{
                width: 24px;
                height: 16px;
            }
        }

        .ais-SearchBox-reset{
            position: absolute;
            top: 7px;
            right: 10px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 50%;
            background-color : #272D2D;

            svg {
                    fill: #fff;
                    stroke: #fff;
                }
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
            flex: 0 0 59.5%;
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
    .user_result{
    width: 100%;
    margin-top: 10px;

        >p{
            font-size: 14px;
        }

        .swiper{
            height: 110px;
            cursor: pointer;

            .swiper-pagination{
                bottom: 0px;
            }
        }
        
        .search_result{
            flex-wrap: wrap;
        }
        .result_user_photo{
            width: 42px;
            height: 42px;
            margin: 0 auto;
            border: 1px solid #ededed;
            border-radius: 50%;
            background-size: cover;
            background-repeat: no-repeat;
        }
        
        .result_name{
            font-size: 16px;
            flex: 1 0 100%;
            margin-top: 8px;
            text-align: center;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
                .ais-SearchBox-loadingIndicator{
                position: absolute;
                left: 50%;
                top: 70px;
                transform: translateX(-50%);
                width: 42px;
                height: 42px;

                svg{
                width : 100%;
                height : 100%;
            }
        }
    // ---------------------------------------------------
`

// 유저 검색 결과
const SwiperHits = () => {
    const { query, refine } = useSearchBox();
    const { items } = useHits();
    const router = useRouter();
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

    const handleUserPage = (userId: string) => {
        router.push(`user/${userId}`)
    }

    const UserHitComponent = ({ hit }: { hit: { displayName: string; photoURL: string; userId: string } }) => (
        <div className="search_result_wrap">
            <div className="search_result"
                onClick={() => handleUserPage(hit.userId)}>
                <div
                    className="result_user_photo"
                    style={{
                        backgroundImage: `url(${hit.photoURL})`,
                    }}
                ></div>
                <p className="result_name">{hit.displayName}</p>
            </div>
        </div >
    );

    return (
        <>
            <Swiper
                spaceBetween={8} // 슬라이드 간격
                slidesPerView={3.5} // 화면에 보이는 슬라이드 개수
                loop={true}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
            >
                {items.map((hit: any, index: number) => (
                    <SwiperSlide key={index}>
                        <UserHitComponent hit={hit} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};

export default function SearchComponent() {
    // functon
    return (
        <SearchWrap>
            <InstantSearch
                searchClient={searchClient}
                indexName="user_index">
                <div className="search_box">
                    <div className="search_bar">
                        <div className="search_input_wrap">
                            <SearchBox placeholder="검색" />
                        </div>
                    </div>
                    {/* 유저 검색 결과 */}
                    <div className="user_result">
                        <SwiperHits />
                    </div>
                </div>
            </InstantSearch>
        </SearchWrap>
    )
}
