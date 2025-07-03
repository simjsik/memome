/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from "@emotion/styled";
import { InstantSearch, SearchBox, useHits, useSearchBox } from "react-instantsearch";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, modalState, statusState, UsageLimitState, UsageLimitToggle } from "../state/PostState";
import { searchClient } from "../utils/algolia";
import LoadingWrap from "./LoadingWrap";
// 검색 창 css
const SearchWrap = styled.div`
position: relative;

    // 메모 검색
    h2{
    flex: 1 0 100%;
    font-size: 1.25rem;
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
    background: ${({ theme }) => theme.colors.background};
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
            stroke : ${({ theme }) => theme.colors.icon_on};
            stroke-width : 2px;
            stroke-linecap: round;
        }
    }
    .search_bar{
    flex: 1 0 100%;
    display: flex;
    height: 42px;
    }
    // -----------------------------------------------------------------------

    // 검색 창
    .search_input_wrap{
    width : 100%;
    height: fit-content;

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
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-radius: 8px;
        font-size : 0.875rem;

            &:focus {
            outline : 1px solid ${({ theme }) => theme.colors.primary};
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
            background-color : ${({ theme }) => theme.colors.text};

            svg {
                    fill: ${({ theme }) => theme.colors.background};
                    stroke: ${({ theme }) => theme.colors.background};
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
            font-size: 0.875rem;
            border: 1px solid ${({ theme }) => theme.colors.border};
            background: ${({ theme }) => theme.colors.background};
            cursor:pointer;
            }

            button{
            flex: 1 0 100%;
            height: 42px;
            font-size: 0.875rem;
            border-top : none;
            background: ${({ theme }) => theme.colors.background};
            }

            button:last-child{
            border-radius: 0px 0px 8px 8px;
            }
        }

        .search_option_toggle_btn{
        width: 100px;
        height: 42px;
        font-size: 0.875rem;
        border: 1px solid ${({ theme }) => theme.colors.border};
        background: ${({ theme }) => theme.colors.background};
        cursor:pointer;
        }
    }
    // -------------------------------------------------

    .search_btn{
        flex : 1 0 0%;
        height: 42px;
        background: ${({ theme }) => theme.colors.icon_on};
        border: none;
        border-radius: 8px;
        color: ${({ theme }) => theme.colors.inverted_text};
    }

    // 검색결과
    .search_result_wrap{
    flex: 1 0 100%;
    height : 100%;
    margin-top : 10px;
    cursor: pointer;

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
                font-size : 0.875rem;
                line-height: 26px;
                color : ${({ theme }) => theme.colors.text_tag};
                margin-right : 4px;
                }

                .result_title{
                max-width : 60%;
                margin-right: 4px;
                font-size: 0.875rem;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                line-height: 26px;
                }

                .result_comment{
                color: ${({ theme }) => theme.colors.error};
                font-size: 0.875rem;
                font-family: var(--font-pretendard-bold);
                line-height: 26px;
                }
            }
            
            // 유저
            .result_user{
            flex: 0 0 20%;
            font-size: 0.875rem;
            margin-right: 4px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            line-height: 26px;
            }

            // 작성일
            .result_date{
            flex: 0 0 20%;
            font-size: 0.875rem;
            line-height: 26px;
            }
        }
    }
    // ---------------------------------------------------
    .user_result{
    width: 100%;
    margin-top: 10px;

        >p{
            font-size: 0.875rem;
        }

        .swiper {
            height: 110px;
            overflow: hidden;

            .swiper-pagination {
                bottom: 0px;
            }

            .swiper-wrapper{
                display: flex;
                height: 100%;
            }
        }

        .swiper-slide{
            width: auto;
            flex-shrink: 0;
        }

        .search_result {
            flex-wrap: wrap;
        }

        .result_user_photo{
            width: 42px;
            height: 42px;
            margin: 0 auto;
            border: 1px solid ${({ theme }) => theme.colors.border};
            border-radius: 50%;
            background-size: cover;
            background-repeat: no-repeat;
        }
        
        .result_name{
            font-size: 1rem;
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
    .ais-SearchBox-loadingIndicator{
        display : none;
    }
    
    @media (min-width: 1921px) {
        .user_result {
            margin-top: 20px;
        }
        .search_input_wrap{
            .ais-SearchBox-input{
                height: 56px;
                padding: 0px 10px 0px 52px;
                line-height: 56px;
                border: 2px solid ${({ theme }) => theme.colors.border};
            }

            .ais-SearchBox-submit svg {
                width: 28px;
                height: 20px;
            }

            .ais-SearchBox-submit {
                width: 56px;
                height: 56px;
            }

            .ais-SearchBox-reset {
                top: 14px;
            }
        }
    }

    @media (min-width: 2560px) {
        .user_result {
            margin-top: 30px;
        }
        .search_input_wrap{
            .ais-SearchBox-input{
                height: 64px;
                padding: 0px 10px 0px 62px;
                line-height: 64px;
                border: 2px solid ${({ theme }) => theme.colors.border};
            }

            .ais-SearchBox-submit svg {
                width: 32px;
                height: 24px;
            }

            .ais-SearchBox-submit {
                width: 64px;
                height: 64px;
            }

            .ais-SearchBox-reset {
                top: 14px;
            }
        }
    }

    @media (min-width: 3840px) {
        .user_result {
            margin-top: 42px;
        }
        .search_input_wrap{
            .ais-SearchBox-input{
                height: 76px;
                padding: 0px 10px 0px 72px;
                line-height: 76px;
                border: 3px solid ${({ theme }) => theme.colors.border};
            }

            .ais-SearchBox-submit svg {
                width: 36px;
                height: 28px;
            }

            .ais-SearchBox-submit {
                width: 76px;
                height: 76px;
            }

            .ais-SearchBox-reset {
                top: 14px;
            }
        }
    }

    
    @media (min-width: 5120px) {
        .user_result {
            margin-top: 64px;
        }

        .search_input_wrap .ais-SearchBox-input {
            height: 92px;
            padding: 0px 20px 0px 88px;
        }

        .search_input_wrap .ais-SearchBox-submit {
            width: 92px;
            height: 92px;
        }
    }
`
interface hit {
    displayName: string;
    photoURL: string;
    userId: string;
}

// 유저 검색 결과
const SwiperHits = () => {
    const router = useRouter();
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

    const { query, refine } = useSearchBox();
    const { items } = useHits<hit>();
    // 검색 결과 대기
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [searchLoading, setSearchLoading] = useState(false); // 로딩 상태 추가

    useEffect(() => {
        if (!yourLogin || usageLimit) {
            if (usageLimit) {
                return setLimitToggle(true);
            }

            if (!yourLogin) {
                setLoginToggle(true);
                setModal(true);
                return;
            }
            return;
        } else {
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
        }
    }, [query, refine])

    if (!query) return <p>작성자 및 키워드를 입력해 검색해 보세요.</p>

    if (searchLoading) {
        return <LoadingWrap></LoadingWrap>;
    }

    // 검색어가 비어 있는 경우
    if (!debouncedQuery.trim()) {
        return <p>작성자 및 키워드를 입력해 검색해 보세요</p>
    }

    const handleUserPage = (userId: string) => {
        if (yourLogin && !usageLimit) {
            router.push(`/home/user/${userId}`)
        } else if (usageLimit) {
            return setLimitToggle(true);
        } else {
            setLoginToggle(true);
            setModal(true);
            return;
        }
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

    if (items.length === 0) {
        return null;
    }
    return (
        <>
            <Swiper
                spaceBetween={16} // 슬라이드 간격
                slidesPerView={3.5} // 화면에 보이는 슬라이드 개수
                freeMode={true}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
            >
                {items.map((hit, index: number) => (
                    <SwiperSlide key={index}>
                        <UserHitComponent hit={hit} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};

export default function SearchComponent() {
    const router = useRouter();
    const yourLogin = useRecoilValue(DidYouLogin)
    const setMobileStatus = useSetRecoilState<boolean>(statusState)
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

    const handleSearch = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // 엔터키를 감지
        if (event.key === 'Enter') {
            if (!yourLogin || usageLimit) {
                if (usageLimit) {
                    return setLimitToggle(true);
                }
                return;
            }

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

    // functon
    return (
        <SearchWrap>
            <InstantSearch
                searchClient={searchClient}
                indexName="user_index">
                <div className="search_box">
                    <div className="search_bar">
                        <div className="search_input_wrap">
                            <SearchBox placeholder="검색"
                                onKeyDown={(event) => handleSearch(event)}
                            />
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
