/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ADMIN_ID, newNoticeState, noticeState, PostData, PostState, postStyleState, storageLoadState, userState } from '../../state/PostState';
import { useRouter } from 'next/navigation';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { PostWrap, TitleHeader } from '../../styled/PostComponents';
import { collection, deleteDoc, doc, getCountFromServer, getDoc, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { auth, db } from '../../DB/firebaseConfig';
import { selectedMenuState } from '../../state/LayoutState';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '../../api/loadToFirebasePostData/fetchPostData';

// Swiper
import SwiperCore from 'swiper'
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
SwiperCore.use([Pagination]);

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
right : 580px;
top : 0;
width : 42px;
height : 42px;
background-repeat: no-repeat;
background-size: cover;
background-color : #fff;
border : none;
border-radius : 8px;
box-shadow : 0px 0px 10px rgba(0,0,0,0.1);
cursor : pointer;
`

const NoticeWrap = styled.div`
position : absolute; 
left : 420px;
top : 0px;
width: 860px;
padding : 10px 20px;
border : none;
border-left : 1px solid #ededed;
border-right : 1px solid #ededed;
background : #fff;
// 공지사항 스타일
    .notice_wrap{

      .post_box{
      position : relative;
      display : flex;
      min-height : 24px;
      margin-bottom : 0;
      padding: 0;
      border-radius : 4px;
      line-height : 36px;
      box-shadow : none;
      }

      .post_title_wrap{
      flex-wrap: nowrap;
      flex : 0 0 60%;
      margin-top : 0;
      padding-left : 20px;
      padding-bottom : 0;
      border-bottom : none;
      }

      // 공지사항 태그
      .post_tag{
      width : auto;
      margin-right : 4px;
      line-height : 36px;
      color : #555;
      font-size : 14px;
      }
      // 공지사항 제목
      .post_title{
      font-size : 14px;
      }

      .user_id,
      .post_date{
      flex : 0 0 50%;
      }

      .user_id{
      margin-right : 0;
      }
      .post_comment{
      font-family : var(--font-pretendard-bold);
      font-size : 14px;
      color: red;
      margin-left : 4px;
      display : block;
      line-height : 36px;
      }
  }

    .post_box:last-child{
    margin-bottom : 40px;
    }
    .post_box:nth-of-type(odd){
      // margin-right : 20px;
    }

    // 포스트 제목
    .post_title_wrap,
    .post_right_wrap{
    font-family : var(--font-pretendard-light);
    display: flex;
    }


    .post_right_wrap{
    display:flex;
    flex: 0 0 40%;
    }

    // 유저 이름, 포스트 날짜, 포스트 댓글
    .user_id,
    .post_date,
    .post_coment {
    font-size : 14px;
    line-height : 36px;
    }

    .post_bottom_wrap{
    display: flex;
    border-top: 1px solid #ededed;
    margin-top: 20px;
    padding-top: 10px;
    }

    .post_comment_icon{
    width: 32px;
    height: 32px;
    background: red;
    margin-right : 4px
    }
    & .user_id:hover,
    .post_title:hover{
    text-decoration : underline;
    cursor: pointer;
    }

  // 포스트 프로필 박스
    .post_profile{
    display:flex;
    }
    .user_profile{
    width : 32px;
    height : 32px;
    margin-right : 4px;
    border-radius: 50%;
    background: red;
    }

  // 포스트 이미지 있을 때 표시
    .post_img_icon{
      width : 16px;
      height : 16px;
      margin : 11px 4px 0px;
      background-size : cover;
      background-repeat : no-repeat;
    }

  // 포스트 이미지 감추기
    .post_text img{
    display : none;
    }

  // 포스트 내용
  .post_text{
    max-height: 300px;
    overflow: hidden;
    max-width: 580px;
  }
    .post_text p{
    line-height : 36px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    }
    .post_text p:nth-of-type(n+3){
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    }

    .post_text p:nth-of-type(n+5){
      display : none
    }

    .swiper-pagination{
        display : none;
    }

    // 페이지네이션
      .pagination_btn_wrap{
      position: relative;
      display: flex;
      justify-content: space-evenly;
      width: fit-content;
      height: 24px;
      margin: 0 auto;
    border-right : 1px solid #ededed;
      border-left : 1px solid #ededed;


        button{
        display: block;
        width: 24px;
        margin-right : 4px;
        border: none;
        background: none;
        cursor:pointer;
        }

        button:last-child{
        margin : 0;
        }
      }
`

interface MainHomeProps {
    posts: PostData[],
    initialNextPage: any;
}

export default function MainHome({ posts: initialPosts, initialNextPage }: MainHomeProps) {
    // 포스트 스테이트
    const [posts, setPosts] = useRecoilState<PostData[]>(PostState)
    const [noticePosts, setNoticePosts] = useState<PostData[]>([])

    // 포스트 길이
    const [postLength, setPostLength] = useState<[number, number]>([0, 0]);

    // 불러온 마지막 데이터
    const [lastParams, setLastParams] = useState<[boolean, Timestamp] | null>(null);
    const [noticeLastParams, setNoticeLastParams] = useState<[boolean, Timestamp] | null>(null);

    // 공지사항 스테이트
    const [notice, setNotice] = useRecoilState<boolean>(noticeState);
    const [noticeHide, setNoticeHide] = useState<boolean>(false);
    const [newNotice, setNewNotice] = useRecoilState<boolean>(newNoticeState);
    const [postStyle, setPostStyle] = useRecoilState<boolean>(postStyleState)

    // 스토리지 기본 값 설정 용
    const [storageLoad, setStorageLoad] = useRecoilState<boolean>(storageLoadState);

    // 현재 로그인 한 유저
    const [currentUser, setCurrentUser] = useRecoilState<string | null>(userState)
    // 메뉴 선택 값
    const [selectedMenu] = useRecoilValue<string>(selectedMenuState);
    const ADMIN = useRecoilValue(ADMIN_ID);
    // state
    const router = useRouter();
    const userId = auth.currentUser?.uid
    const swiperRef = useRef<SwiperCore | null>(null);
    const observerLoadRef = useRef(null);


    // 로그인 시 유저 아이디 설정
    useEffect(() => {
        if (userId) {
            setCurrentUser(userId)
        }
    }, [userId])

    // 무한 스크롤 로직
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: ({ pageParam }) => fetchPosts(pageParam, 4, 0), // pageParam 전달
        getNextPageParam: (lastPage) => lastPage.nextPage || undefined,
        staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
        initialPageParam: initialNextPage, // 초기 페이지 파라미터 설정
        initialData: {
            pages: [{ data: initialPosts, nextPage: initialNextPage }],
            pageParams: [initialNextPage],

        },
    });

    // 무한 스크롤 로직의 data가 변할때 마다 posts 배열 업데이트
    useEffect(() => {
        const lastPage = data.pages.at(-1);

        const uniquePosts = Array.from(
            new Map(data.pages.flatMap((page) => page.data as PostData[]).map(post => [post.id, post])).values()
        );

        setPosts(uniquePosts);

        if (lastPage?.nextPage) {
            const [notice, createAt] = lastPage.nextPage;
            setLastParams([notice, createAt]); // [number, Timestamp]
        }
    }, [data.pages])

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {
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

    // 포스트 스타일, 공지사항 값 별 포스트 길이 함수
    const getTotalPost = async (notice: boolean) => {
        if (!notice) { // 공지사항 제외 길이.
            const totalPost = await getCountFromServer(query(collection(db, 'posts'), where('notice', '==', false)));
            const totalPostLength = totalPost.data().count; // 전체 포스트 수
            const totalPages = Math.ceil(totalPostLength / 10); // 페이지당 10개 기준

            setPostLength([totalPages, totalPostLength])

        } else { // 공지사항 길이만.
            const totalPost = await getCountFromServer(query(collection(db, 'posts'), where('notice', '==', true)));
            const totalPostLength = totalPost.data().count; // 전체 포스트 수
            const totalPages = Math.ceil(totalPostLength / 10); // 페이지당 10개 기준

            setPostLength([totalPages, totalPostLength])
        }
    }

    // 초기 포스트 길이 가져오기
    useEffect(() => {
        if (!postStyle) {
            getTotalPost(notice);
        }
    }, [])

    // 공지사항 탭 시 데이터 변경
    useEffect(() => {
        if (notice || noticePosts.length <= 0) {
            // 포스트 스타일 변경 및 공지사항 탭 시 공지사항 데이터 가져오기.
            let unsubscribe: () => void;

            unsubscribe = onSnapshot(
                query(collection(db, 'posts'), where('notice', '==', true), orderBy('createAt', 'desc'), limit(10)),// 공지사항이므로 notice 정렬 제외
                (snapshot) => {
                    const postData: PostData[] = snapshot.docs.map((doc) => ({
                        ...doc.data(),
                        id: doc.id,
                    })) as PostData[];


                    if (snapshot.docs.length > 0) {
                        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
                        setNoticeLastParams([lastDoc.data().notice, lastDoc.data().createAt]); // 페이지네이션을 위한 마지막 문서 저장
                    } else {
                        setNoticeLastParams(null); // 마지막 문서가 없을 경우 null 처리
                    }
                    setNoticePosts(postData);
                }
            );
            return () => unsubscribe();
        }
        getTotalPost(notice);

    }, [selectedMenu, notice, postStyle])

    // 탭 변경
    useEffect(() => {
        getTotalPost(notice);

        if (!postStyle) {
            handleClickPagenation(1);
        }
    }, [notice])

    // 페이지네이션 로직
    const handleClickPagenation = async (page: number) => {

        const pageSize = 10 * page;

        if ((posts.length >= pageSize || (!lastParams && !noticeLastParams) || posts.length >= postLength[1]))
            return console.log('함수 요청 안함.');
        // `현재 포스트 길이가 페이지 최대 수`와 같거나 크면 또는
        // `마지막 포스트 데이터가 없으면` 또는
        // `전체 포스트 수`보다 같거나 커지면 요청 X

        // 공지사항 요청
        if (notice && noticeLastParams) {
            const newPosts = await fetchPosts(noticeLastParams, pageSize, noticePosts.length);

            setNoticePosts((prevPosts) => [...prevPosts, ...newPosts.data as PostData[]]); // 기존 데이터에 추가
            setNoticeLastParams(newPosts.nextPage as any); // 다음 페이지 정보 업데이트
        }
        // 일반 포스트 요청
        else if (lastParams) {
            const newPosts = await fetchPosts(lastParams, pageSize, posts.length);

            setPosts((prevPosts) => [...prevPosts, ...newPosts.data as PostData[]]); // 기존 데이터에 추가
            setLastParams(newPosts.nextPage as any); // 다음 페이지 정보 업데이트
        }
    }

    // 포스트 스타일 변경 시 기본 페이지네이션 용 데이터 가져오기
    useEffect(() => {
        if (!postStyle && !notice) {
            handleClickPagenation(1);
        }
    }, [postStyle])

    // 공지사항 알림
    useEffect(() => {
        let lastNoticeTimestamp: number | null = null;

        const unsubscribe = onSnapshot(query(collection(db, 'posts'), where('notice', '==', true), orderBy('createAt', 'desc')),
            (snapshot) => {
                const newDocs = snapshot.docChanges().filter((change) => change.type === 'added');

                if (newDocs.length > 0) {
                    const timeNewDocs = newDocs.some(
                        (doc) =>
                            lastNoticeTimestamp === null || doc.doc.data().createAt.toMillis() > lastNoticeTimestamp
                    );

                    if (timeNewDocs) {
                        setNewNotice(true);
                        lastNoticeTimestamp = newDocs[0].doc.data().createAt.toMillis();
                    }
                }
            })
        return () => unsubscribe();
    }, [])

    // // 포스트 리스트 변경 시 실시간 반영
    useEffect(() => {

        // const q = query(collection(db, 'posts'), orderBy('notice', 'desc'), orderBy('createAt', 'desc'));

        // const unsubscribe = onSnapshot(q, (querySnapshot) => {
        //     const fetchedPosts: PostData[] = []; // 타입 설정
        //     querySnapshot.forEach((doc) => {
        //         const postData = { id: doc.id, ...doc.data() } as PostData;
        //         postData.images = extractImageUrls(postData.content);
        //         fetchedPosts.push(postData);
        //     });
        //     setPosts(fetchedPosts);
        // });

        // return () => unsubscribe();
    }, []);

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

    // 공지사항 숨기기
    const noticeHideToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNoticeHide(e.target.checked)
    }
    // function

    // 포스팅 저장된 내용 확인. 있어야 이미지 불러와짐
    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('unsavedPost')!);
        if (savedData) {
            setStorageLoad(true);
        } else {
            setStorageLoad(false);
        }
    }, [])

    return (
        <>
            {/* 공지사항 전체 페이지네이션*/}
            {notice &&
                <>
                    <NoticeWrap>
                        {/* 페이지네이션 타이틀 */}
                        <TitleHeader>
                            <p className='notice_post'>공지사항</p>
                            <div className='post_header'>
                                <p className='h_title'>제목</p>
                                <p className='h_user'>작성자</p>
                                <p className='h_date'>날짜</p>
                            </div>
                        </TitleHeader>
                        <Swiper
                            slidesPerView={1}
                            onSwiper={(swiper) => (swiperRef.current = swiper)} // Swiper 인스턴스 저장
                            pagination={{
                                clickable: true,
                            }}
                            modules={[Pagination]}
                            className="mySwiper notice_wrap"
                        >
                            {Array.from({ length: postLength[0] }, (_, pageIndex) => (
                                <SwiperSlide key={pageIndex} >
                                    {noticePosts.map((post) => (
                                        <div key={post.id} className='post_box'>
                                            <div className='post_title_wrap'>
                                                {(post.images && post.images?.length > 0) ?
                                                    <div className='post_img_icon'
                                                        css={css`
                                                    background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1734335311/%EC%82%AC%EC%A7%84_atcwhc.svg)
                                                    `}>
                                                    </div>
                                                    :
                                                    <div className='post_img_icon'>
                                                    </div>
                                                }
                                                <span className='post_tag'>[{post.tag}]</span>
                                                <h2 className='post_title' onClick={() => handlePostClick(post.id)}>{post.title}</h2>
                                                {post.commentCount > 0 &&
                                                    <p className='post_comment'>[{post.commentCount}]</p>
                                                }
                                            </div>
                                            <div className='post_right_wrap'>
                                                <p className='user_id'>
                                                    {post.userId === '8KGNsQPu22Mod8QrXh6On0A8R5E2' ? '관리자 ' : post.userId}
                                                </p>
                                                <p className='post_date'>{formatDate(post.createAt)}</p>
                                            </div>
                                            {post.userId === auth.currentUser?.uid &&
                                                <button className='post_delete_btn' css={postDeleteBtn} onClick={() => deletePost(post.id)}></button>
                                            }
                                        </div>
                                    ))}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        {/* 페이지네이션 버튼 */}
                        <div className='pagination_btn_wrap'>
                            {Array.from({ length: postLength[0] }, (_, index) => (
                                <button key={index} onClick={() => { handleClickPagenation(index + 1); swiperRef.current?.slideTo(index, 0); }}>
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </NoticeWrap >

                </>
            }
            {/* 공지사항 제외 전체 포스트 */}
            {!notice &&
                <PostWrap postStyle={postStyle}>
                    <>
                        {!postStyle ?
                            <>
                                {/* 페이지네이션 타이틀 */}
                                <TitleHeader>
                                    <div className='title_wrap'>
                                        <p className='all_post'>전체 글</p>
                                        <div className='hide_notice_wrap'>
                                            <label>
                                                <input onChange={noticeHideToggle} type='checkbox' className='hide_notice_btn'></input>
                                                <span></span>
                                                <p className='hide_text'>공지사항 숨기기</p>
                                            </label>
                                        </div>
                                    </div>
                                    <div className='post_header'>
                                        <p className='h_title'>제목</p>
                                        <p className='h_user'>작성자</p>
                                        <p className='h_date'>날짜</p>
                                    </div>
                                </TitleHeader>
                                {/* 포스트 전체 */}
                                {!notice &&
                                    <>
                                        {/* 최신 공지사항 5개 */}
                                        {!noticeHide &&
                                            noticePosts.slice(0, 5).map((post) => (
                                                <div key={post.id} className={post.notice ? 'post_box notice' : 'post_box'}>
                                                    <div className='post_title_wrap'>
                                                        {(post.images && post.images?.length > 0) ?
                                                            <div className='post_img_icon'
                                                                css={css`
                                                                background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1734335311/%EC%82%AC%EC%A7%84_atcwhc.svg)
                                                                `}>
                                                            </div>
                                                            :
                                                            <div className='post_img_icon'>
                                                            </div>
                                                        }
                                                        <span className='post_tag'>[{post.tag}]</span>
                                                        <h2 className='post_title' onClick={() => handlePostClick(post.id)}>{post.title}</h2>
                                                        {post.commentCount > 0 &&
                                                            <p className='post_comment'>[{post.commentCount}]</p>
                                                        }
                                                    </div>
                                                    <div className='post_right_wrap'>
                                                        <p className='user_id'>
                                                            {post.userId === '8KGNsQPu22Mod8QrXh6On0A8R5E2' ? '관리자 ' : post.userId}
                                                        </p>
                                                        <p className='post_date'>{formatDate(post.createAt)}</p>
                                                    </div>
                                                    {post.userId === auth.currentUser?.uid &&
                                                        <button className='post_delete_btn' css={postDeleteBtn} onClick={() => deletePost(post.id)}></button>
                                                    }
                                                </div>
                                            ))
                                        }

                                        {/* 전체 포스트 */}
                                        <Swiper
                                            slidesPerView={1}
                                            onSwiper={(swiper) => (swiperRef.current = swiper)} // Swiper 인스턴스 저장
                                            pagination={{
                                                clickable: true,
                                            }}
                                            modules={[Pagination]}
                                            className="mySwiper"
                                        >
                                            {Array.from({ length: postLength[0] }, (_, pageIndex) => (
                                                <SwiperSlide key={pageIndex}>
                                                    {posts
                                                        .slice(pageIndex * 10, (pageIndex + 1) * 10)
                                                        .map((post) => (
                                                            <div key={post.id} className={post.notice ? 'post_box notice' : 'post_box'}>
                                                                <div className='post_title_wrap'>
                                                                    {(post.images && post.images?.length > 0) ?
                                                                        <div className='post_img_icon'
                                                                            css={css`
                                                                            background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1734335311/%EC%82%AC%EC%A7%84_atcwhc.svg)
                                                                            `}>
                                                                        </div>
                                                                        :
                                                                        <div className='post_img_icon'>
                                                                        </div>
                                                                    }
                                                                    <span className='post_tag'>[{post.tag}]</span>
                                                                    <h2 className='post_title' onClick={() => handlePostClick(post.id)}>{post.title}</h2>
                                                                    {post.commentCount > 0 &&
                                                                        <p className='post_comment'>[{post.commentCount}]</p>
                                                                    }
                                                                </div>
                                                                <div className='post_right_wrap'>
                                                                    <p className='user_id'>
                                                                        {post.userId === '8KGNsQPu22Mod8QrXh6On0A8R5E2' ? '관리자 ' : post.userId}
                                                                    </p>
                                                                    <p className='post_date'>{formatDate(post.createAt)}</p>
                                                                </div>
                                                                {post.userId === auth.currentUser?.uid &&
                                                                    <button className='post_delete_btn' css={postDeleteBtn} onClick={() => deletePost(post.id)}></button>
                                                                }
                                                            </div>
                                                        ))}
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </>
                                }
                                {/* 페이지네이션 버튼 */}
                                <div className='pagination_btn_wrap'>
                                    {Array.from({ length: postLength[0] }, (_, index) => (
                                        <button key={index} onClick={() => { handleClickPagenation(index + 1); swiperRef.current?.slideTo(index, 0); }}>
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </>
                            :
                            <>
                                {/* 무한 스크롤 구조 */}
                                {posts.map((post) => (
                                    <div key={post.id} className='post_box' onClick={() => handlePostClick(post.id)}>
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
                                        </div>
                                        {/* 포스트 제목 */}
                                        <div className='post_title_wrap'>
                                            <span className='post_tag'>[{post.tag}]</span>
                                            <h2 className='post_title'>{post.title}</h2>
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
                                                            height : ${post.images?.length === 1 ? '400px'
                                                                    :
                                                                    post.images?.length === 2 ? '300px'
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
                        }
                    </>
                    <PostStyleBtn className='post_style_btn' onClick={() => setPostStyle((prev) => !prev)} ></PostStyleBtn>
                </PostWrap>
            }
        </>
    )
}