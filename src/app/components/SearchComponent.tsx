/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from "@emotion/styled";
import { Configure, Index, InstantSearch, Pagination, SearchBox, SearchBoxProps, useHits, useSearchBox } from "react-instantsearch";
import { searchClient } from "../api/algolia";
import { TitleHeader } from "../styled/PostComponents";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { searchState } from "../state/PostState";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../DB/firebaseConfig";
import { Swiper, SwiperSlide } from "swiper/react";

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
        .post_result{
            width: 100%;
            margin-top : 10px;
            >p{
            font-size : 14px;
            }
            .search_result_wrap{
            position: relative;
            margin-top: 10px;
            min-height: 250px;
            }
            .ais-Pagination-list{
            display: flex;

                .ais-Pagination-item--firstPage{
                    margin-right : 4px;
                }
                .ais-Pagination-item--previousPage{
                    margin-right : 4px;
                }
                .ais-Pagination-item--page{
                    padding : 0px 8px;
                    color :rgb(173, 173, 173);
                    font-family : var(--font-pretendard-light);
                }
                .ais-Pagination-item--nextPage{
                    margin-right : 4px;
                }
                .ais-Pagination-item--disabled{
                    opacity : 30%
                }
                .ais-Pagination-item--selected{
                    color : #4759A8;
                    font-family : var(--font-pretendard-medium);
                }
            }
            .ais-Pagination{
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
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
        }
        .search_result{
            flex-wrap: wrap;
            cursor: pointer;
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


// 유저 검색 결과
const SwiperHits = ({ onUserClick }: { onUserClick: (uid: string) => void }) => {
    const { items } = useHits();

    const UserHitComponent = ({ hit }: { hit: { displayName: string; photoURL: string; userId: string } }) => (
        <div className="search_result_wrap"
            onClick={() => onUserClick(hit.userId)} // 유저 클릭 시 UID 전달
        >
            <div className="search_result">
                <div
                    className="result_user_photo"
                    style={{
                        backgroundImage: `url(${hit.photoURL})`,
                    }}
                ></div>
                <p className="result_name">{hit.displayName}</p>
                <p className="result_name">{hit.userId}</p>
            </div>
        </div >
    );

    return (
        <>
            <Swiper
                spaceBetween={16} // 슬라이드 간격
                slidesPerView={5} // 화면에 보이는 슬라이드 개수
                pagination={{ clickable: true }} // 페이지네이션 활성화
                navigation // 네비게이션 활성화
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

// 포스트 검색 결과
const SearchResults = () => {
    const { items } = useHits(); // 검색 결과 가져오기

    const [userMap, setUserMap] = useState<Record<string, { displayName: string; photoURL: string }> | null>(null);

    // 사용자 데이터 가져오기
    useEffect(() => {
        const uniqueUserIds = [...new Set(items.map((hit: any) => hit.userId))];

        const fetchUserData = async () => {
            try {
                const userDocs = await Promise.all(
                    uniqueUserIds.map((id) => getDoc(doc(db, 'users', id)))
                );

                const fetchedUserMap = userDocs.reduce((acc, userDoc) => {
                    if (userDoc.exists()) {
                        acc[userDoc.id] = userDoc.data() as { displayName: string; photoURL: string };;
                    }
                    return acc;
                }, {} as Record<string, { displayName: string; photoURL: string }>);

                setUserMap(fetchedUserMap);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (uniqueUserIds.length > 0) {
            fetchUserData();
        }
    }, [items]);

    const PostHitComponent = ({ hit }: { hit: { title: string; tag: string; commentCount: number; createAt: string; userId: string } }) => {
        const userData = userMap ? userMap[hit.userId] : null;

        return (
            <div className="search_result" >
                <div className="result_post_title">
                    <div className="result_img_icon"></div>
                    <p className="result_title">{hit.title}</p>
                    <span className="result_comment">[{hit.commentCount}]</span>
                </div>
                <p className="result_user">
                    {userData ? userData.displayName : '알 수 없음'}
                </p>
                <p className="result_date">{formatDate(hit.createAt)}</p>
            </div >
        )
    };

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

const queryHook: SearchBoxProps['queryHook'] = (query, search) => {
    search(query);
};

function CustomSearchBox() {
    const { refine } = useSearchBox();

    const handleButtonClick = () => {
        // 버튼 클릭 시 변경할 쿼리
        const newQuery = '새로운 검색어';
        refine(newQuery); // SearchBox의 쿼리를 변경
    };

    return (
        <div>
            <SearchBox />
            <button onClick={handleButtonClick}>검색어 변경</button>
        </div>
    );
}
export default function SearchComponent() {
    const [searchToggle, setSearchToggle] = useRecoilState<boolean>(searchState)
    const [userFilter, setUserFilter] = useState<string | null>(null);
    // functon
    return (
        <SearchWrap>
            <InstantSearch
                searchClient={searchClient}
                indexName="post_index">
                <div className="search_box">
                    <button className="search_close_btn" onClick={() => setSearchToggle(false)}>
                        <svg viewBox="0 0 40 40">
                            <g>
                                <polyline className="close_polyline" points="40 40 0 40 0 0" />
                                <line className="close_line" x1="8" y1="32" x2="32" y2="8" />
                                <line className="close_line" x1="8" y1="8" x2="32" y2="32" />
                            </g>
                        </svg>
                    </button>
                    <h2>메모 검색</h2>
                    <div className="search_bar">
                        <div className="search_input_wrap">
                            <SearchBox queryHook={queryHook} searchAsYouType={false} placeholder="작성자 및 제목 검색" />
                        </div>
                    </div>
                    {/* 유저 검색 결과 */}
                    <Index indexName="user_index">
                        <div className="user_result">
                            <p>작성자</p>
                            <SwiperHits onUserClick={(uid) => setUserFilter(uid)} />
                        </div>
                    </Index>

                    {/* 게시글 결과 */}
                    <Index indexName="post_index">
                        <div className="post_result" >
                            <p>게시글</p>
                            <TitleHeader>
                                <div className='post_header'>
                                    <p className='h_title'>제목</p>
                                    <p className='h_user'>작성자</p>
                                    <p className='h_date'>날짜</p>
                                </div>
                            </TitleHeader>
                            <div className="search_result_wrap">
                                <SearchResults />
                            </div>
                        </div>
                    </Index>
                </div>
            </InstantSearch>
        </SearchWrap>
    )
}
