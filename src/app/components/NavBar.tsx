/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedMenuState } from '../state/LayoutState';
import { usePathname, useRouter } from 'next/navigation';
import { DidYouLogin, hasGuestState, ImageUrlsState, loginToggleState, newNoticeState, PostingState, PostTitleState, SelectTagState, statusState, UsageLimitState, UsageLimitToggle, userData, userState } from '../state/PostState';
import { useEffect } from 'react';
import { css } from '@emotion/react';
import { saveUnsavedPost } from '../utils/saveUnsavedPost';
import { useMediaQuery } from 'react-responsive';

const NavBarWrap = styled.div`
position: fixed;
top: 0;
left: 0;
width: 80px;
height : 100%;
background: #fff;

    .nav_wrap{
        position: relative;
        top: 50%;
        transform: translateY(-50%);
    }

    .mb_status{
        position: absolute;
        left: 50%;
        bottom: 40px;
        transform: translateX(-50%);
        background-size : cover;
        background-position : center;
        width : 42px;
        height : 42px;
        margin : 0 auto;
        border : 1px solid #ededed;
        border-radius : 50%;
        background-color : #fff;
    }

    @media (max-width: 480px) {
        position: fixed;
        top : auto;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 82px;
        background: #fff;
        z-index: 1;
        border-top: 1px solid #ededed;

        .nav_wrap{
            display : flex;
            position: relative;
            top: 40%;
            transform: translateY(-50%);
        }

        .mb_status{
            position: absolute;
            left : auto;
            right: 24px;
            bottom: 100px;
            transform : none;
        }
    }

    @media (min-width: 1921px) {
        width: clamp(80px, calc(80px + (100vw - 1921px) * 0.040625), 106px);
    }
    @media (min-width: 2560px) {
        width: clamp(106px, calc(106px + (100vw - 2560px) * 0.040625), 132px);
    }
    @media (min-width: 3840px) {
        width: clamp(132px, calc(132px + (100vw - 3840px) * 0.040625), 158px);
    }
    @media (min-width: 5120px) {
        width: clamp(158px, calc(158px + (100vw - 5120px) * 0.040625), 164px);
    }
`
const NavMenu = styled.div<{ isActive: boolean }>`
display : flex;
flex-direction: column;
align-items: center;
width : 48px;
height : 48px;
margin : 0 auto;
margin-top: 20px;
border-radius : 8px;
cursor: pointer;

.post_alarm{
position : absolute;
right: 10px;
width :6px;
height : 6px;
border-radius : 50%;
}

.menu_icon,
.no_active_icon {
    width : 40px;
    height : 40px;
    margin-top: 4px;

    svg{
        width: 40px;
        height : 40px;
    }
}
.no_active_icon{
cursor : default;
}
.menu_p{
font-size : 12px;
color : ${(props) => props.isActive ? '#191919' : '#acacac'};
font-family : ${(props) => (props.isActive && 'var(--font-pretendard-bold)')};
line-height : 20px;
}

.menu_underbar{
width: 70%;
height: 2px;
}

&:hover{
background : #f9f9f9;
}
    @media (max-width: 480px) {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 48px;
        height: 48px;
        margin: 0 auto;
        margin-top: 0px;
        border-radius: 8px;
        cursor: pointer;
    }

  @media (min-width: 1921px) {
    width: clamp(48px, calc(48px + (100vw - 1921px) * 0.021875), 62px);
    height: clamp(48px, calc(48px + (100vw - 1921px) * 0.021875), 62px);
    margin-top: 26px;
    
    .menu_icon,
    .no_active_icon {
        width: clamp(40px, calc(40px + (100vw - 1921px) * 0.01875), 52px);
        height: clamp(40px, calc(40px + (100vw - 1921px) * 0.01875), 52px);

        svg{
            width: 100%;
            height: 100%;
        }
    }
  }

  @media (min-width: 2560px) {
    width: clamp(62px, calc(62px + (100vw - 2560px) * 0.01875), 86px);
    height: clamp(62px, calc(62px + (100vw - 2560px) * 0.01875), 86px);
    margin-top: clamp(26px, calc(26px + (100vw - 2560px) * 0.01875), 36px);

    .menu_icon,
    .no_active_icon {
        width: clamp(52px, calc(52px + (100vw - 2560px) * 0.01875), 64px);
        height: clamp(52px, calc(52px + (100vw - 2560px) * 0.01875), 64px);
    }
  }

  @media (min-width: 3840px) {
    width: clamp(86px, calc(86px + (100vw - 3840px) * 0.01875), 112px);
    height: clamp(86px, calc(86px + (100vw - 3840px) * 0.01875), 112px);
    margin-top: clamp(36px, calc(26px + (100vw - 3840px) * 0.01875), 42px);

    .menu_icon,
    .no_active_icon {
        width: clamp(64px, calc(64px + (100vw - 3840px) * 0.01875), 76px);
        height: clamp(64px, calc(64px + (100vw - 3840px) * 0.01875), 76px);
    }
  }
`

export default function NavBar() {
    const yourLogin = useRecoilValue(DidYouLogin);
    const currentUser = useRecoilValue<userData | null>(userState);
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState);
    const [selectedMenu, setSelectedMenu] = useRecoilState<number>(selectedMenuState);
    const [newNotice, setNewNotice] = useRecoilState<boolean>(newNoticeState);
    const usageLimit = useRecoilValue<boolean>(UsageLimitState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle);
    const [hasGuest, setHasGuest] = useRecoilState(hasGuestState);
    const postTitle = useRecoilValue<string>(PostTitleState);
    const posting = useRecoilValue<string>(PostingState);
    const imageUrls = useRecoilValue<string[]>(ImageUrlsState);
    const selectTag = useRecoilValue<string>(SelectTagState);
    const setMobileStatus = useSetRecoilState<boolean>(statusState);

    const isMobile = useMediaQuery({ maxWidth: 1200 });
    // State
    const router = useRouter();
    const path = usePathname();
    useEffect(() => {
        if (path) {
            const pathSegment = path?.split('/').filter(Boolean);
            if (pathSegment[1] === 'main') {
                setSelectedMenu(2);
            } else if (pathSegment[1] === 'bookmark') {
                setSelectedMenu(3);
            } else if (pathSegment[1] === 'user') {
                setSelectedMenu(4);
            } else if (pathSegment[1] === 'notice') {
                setSelectedMenu(1);
            }
        }
    }, [path, setSelectedMenu])

    // 내비 클릭 시 선택 메뉴 설정
    const handleNavClick = (NavTitle: number) => {
        if (NavTitle) {
            // 현재 스크롤 위치를 sessionStorage에 저장
            sessionStorage.setItem(
                `scroll-${path}`,
                window.scrollY.toString()
            );

            const unsavedPost = {
                tag: selectTag,
                title: postTitle,
                content: posting,
                date: new Date(),
                images: imageUrls
            }

            saveUnsavedPost(unsavedPost)
        }

        if (usageLimit || !yourLogin) {
            if (usageLimit) {
                setLimitToggle(true);
                return;
            }

            if (!yourLogin) {
                setLoginToggle(true);
                return;
            }
        }
        if (NavTitle === 1) {
            router.push('/home/notice');
            setNewNotice(false);
        } else if (NavTitle === 2) {
            router.push('/home/main');
        } else if (NavTitle === 3) {
            router.push(`/home/bookmark/${currentUser?.uid}`);
        } else if (NavTitle === 4) {
            router.push(`/home/user/${currentUser?.uid}`)
        } else if (NavTitle === 5) {
            router.push('/home/post');
        }
        setSelectedMenu(NavTitle);
    }

    // 768 상태 창 핸들러
    const statusHandle = () => {
        setMobileStatus((prev) => !prev);
    }

    useEffect(() => {
        if (typeof hasGuest === 'string') {
            if (hasGuest === 'false') {
                setHasGuest(false);
            }
            if (hasGuest === 'true') {
                setHasGuest(true);
            }
        }
    }, [hasGuest])
    // Function


    return (
        <>
            {path !== '/home/post' &&
                <NavBarWrap>
                    <div className='nav_wrap'>
                        {/* 공지사항 */}
                        <NavMenu isActive={1 === selectedMenu} onClick={() => handleNavClick(1)}>
                            <div className='post_alarm' css={css`${newNotice ? 'background : red' : 'background : none'}`}></div>
                            <div className='menu_icon'>
                                {1 === selectedMenu ?
                                    <svg viewBox="0 0 40 40">
                                        <g>
                                            <path className='notice_path_01' d="M29.55,26.26,28.36,25a1.14,1.14,0,0,1-.3-.77V19.26a8.29,8.29,0,0,0-7-8.32,8.09,8.09,0,0,0-9.14,8v5.23a1.14,1.14,0,0,1-.3.77l-1.19,1.31a1.72,1.72,0,0,0,1.26,2.87H28.29A1.72,1.72,0,0,0,29.55,26.26Z" fill="#050505" />
                                            <path className='notice_path_02' d="M17.51,29.13a.34.34,0,0,0-.35.37,2.86,2.86,0,0,0,5.68,0,.34.34,0,0,0-.35-.37Z" fill="#050505" />
                                            <circle cx="20" cy="10" r="2" fill="#050505" />
                                            <rect fill="none" />
                                        </g>
                                    </svg>
                                    :
                                    <svg viewBox="0 0 40 40">
                                        <g>
                                            <path className='notice_path_01' d="M29.55,26.26,28.36,25a1.14,1.14,0,0,1-.3-.77V19.26a8.29,8.29,0,0,0-7-8.32,8.09,8.09,0,0,0-9.14,8v5.23a1.14,1.14,0,0,1-.3.77l-1.19,1.31a1.72,1.72,0,0,0,1.26,2.87H28.29A1.72,1.72,0,0,0,29.55,26.26Z" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                            <path className='notice_path_02' d="M17.51,29.13a.34.34,0,0,0-.35.37,2.86,2.86,0,0,0,5.68,0,.34.34,0,0,0-.35-.37Z" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                            <circle cx="20" cy="9.15" r="1.15" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                            <rect fill="none" />
                                        </g>
                                    </svg>
                                }
                            </div>
                        </NavMenu>
                        {/* 메인 / 전체 포스트 */}
                        <NavMenu isActive={2 === selectedMenu} onClick={() => handleNavClick(2)}>
                            <div className='post_alarm'></div>
                            <div className='menu_icon'>
                                {2 === selectedMenu ?
                                    <svg viewBox="0 0 40 40">
                                        <g>
                                            <path d="M17.524,9.65,7.642,18.462A2.4,2.4,0,0,0,7,20.144v8.6a2.217,2.217,0,0,0,2.118,2.3h4.765A2.217,2.217,0,0,0,16,28.743V23.2a2.209,2.209,0,0,1,2.118-2.291h1.722A2.209,2.209,0,0,1,21.957,23.2v5.544a2.217,2.217,0,0,0,2.118,2.3h4.807A2.217,2.217,0,0,0,31,28.743v-8.6a2.4,2.4,0,0,0-.649-1.66L20.468,9.672a2.059,2.059,0,0,0-2.943-.022Z" transform="translate(1.5 0.458)" fill="#050505" />
                                            <rect fill="none" />
                                        </g>
                                    </svg>
                                    :
                                    <svg viewBox="0 0 40 40">
                                        <g>
                                            <path d="M17.524,9.65,7.642,18.462A2.4,2.4,0,0,0,7,20.144v8.6a2.217,2.217,0,0,0,2.118,2.3h4.765A2.217,2.217,0,0,0,16,28.743V23.2a2.209,2.209,0,0,1,2.118-2.291h1.722A2.209,2.209,0,0,1,21.957,23.2v5.544a2.217,2.217,0,0,0,2.118,2.3h4.807A2.217,2.217,0,0,0,31,28.743v-8.6a2.4,2.4,0,0,0-.649-1.66L20.468,9.672a2.059,2.059,0,0,0-2.943-.022Z" transform="translate(1.5 0.458)" fill="none" stroke="#ccc" strokeMiterlimit="10" strokeWidth="2" />
                                            <rect fill="none" />
                                        </g>
                                    </svg>}
                            </div>
                        </NavMenu>
                        {/* 북마크 */}
                        {hasGuest ?
                            < NavMenu isActive={false}>
                                <div className='no_active_icon'>
                                    <svg viewBox="0 0 39 40">
                                        <g>
                                            <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z"
                                                fill="none" stroke='#050505' strokeWidth={'2.5'} opacity={0.1} />
                                            <rect fill="none" stroke='none' />
                                        </g>
                                    </svg>
                                </div>
                            </NavMenu>
                            :
                            <NavMenu isActive={3 === selectedMenu} onClick={() => handleNavClick(3)}>
                                <div className='menu_icon'>
                                    {3 === selectedMenu ?
                                        <svg viewBox="0 0 40 40">
                                            <g>
                                                <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z"
                                                    fill="#050505" />
                                                <rect fill="none" stroke='none' />
                                            </g>
                                        </svg>
                                        :
                                        <svg viewBox="0 0 40 40">
                                            <g>
                                                <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z"
                                                    fill="none" stroke='#ccc' strokeWidth={'2.5'} />
                                                <rect fill="none" stroke='none' />
                                            </g>
                                        </svg>
                                    }
                                </div>
                            </NavMenu>
                        }
                        {/* 프로필 */}
                        {hasGuest ?
                            <NavMenu isActive={false}>
                                <div className='no_active_icon'>
                                    <svg viewBox="0 0 36 36">
                                        <g id="Layer_2" data-name="Layer 2">
                                            <circle cx="18" cy="11.5" r="4" fill="none" stroke='#050505' strokeWidth={'2.5'} opacity={0.1} />
                                            <path d="M27.3,28.5a2,2,0,0,0,1.6-2.62C27.6,21.63,23.22,18.5,18,18.5S8.4,21.63,7.1,25.88A2,2,0,0,0,8.7,28.5Z"
                                                fill="none" stroke='#050505' strokeWidth={'2.5'} opacity={0.1} />
                                            <rect fill="none" stroke='none' />
                                        </g>
                                    </svg>
                                </div>
                            </NavMenu>
                            :
                            <NavMenu isActive={4 === selectedMenu} onClick={() => handleNavClick(4)}>
                                <div className='menu_icon'>
                                    {4 === selectedMenu ?
                                        <svg viewBox="0 0 36 36">
                                            <g id="Layer_2" data-name="Layer 2">
                                                <circle cx="18" cy="11.5" r="4" fill="#050505" stroke="none" />
                                                <path d="M27.3,28.5a2,2,0,0,0,1.6-2.62C27.6,21.63,23.22,18.5,18,18.5S8.4,21.63,7.1,25.88A2,2,0,0,0,8.7,28.5Z" fill="#050505" stroke='none' strokeWidth={'2.5'} />
                                                <rect fill="none" stroke='none' />
                                            </g>
                                        </svg>
                                        :
                                        <svg viewBox="0 0 36 36">
                                            <g id="Layer_2" data-name="Layer 2">
                                                <circle cx="18" cy="11.5" r="4" fill="none" stroke='#ccc' strokeWidth={'2.5'} />
                                                <path d="M27.3,28.5a2,2,0,0,0,1.6-2.62C27.6,21.63,23.22,18.5,18,18.5S8.4,21.63,7.1,25.88A2,2,0,0,0,8.7,28.5Z" fill="none" stroke='#ccc' strokeWidth={'2.5'} />
                                                <rect fill="none" stroke='none' />
                                            </g>
                                        </svg>
                                    }

                                </div>
                            </NavMenu>
                        }
                        {/* 포스팅 */}
                        {hasGuest ?
                            <NavMenu isActive={false}>
                                <div className='no_active_icon'>
                                    <svg viewBox="0 0 40 40">
                                        <g>
                                            <path d="M18,8H11.25A3.25,3.25,0,0,0,8,11.25v13.5A3.25,3.25,0,0,0,11.25,28h13.5A3.25,3.25,0,0,0,28,24.75V18"
                                                transform="translate(1 1)" fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2.5" stroke='#050505' opacity={0.1} />
                                            <path d="M24,21.718a.524.524,0,0,0,.524.532l1.253-.16a.569.569,0,0,0,.3-.142L37.858,10.158a.753.753,0,0,0-.142-1.029l-.6-.594a.757.757,0,0,0-1.031-.142L24.276,20.174a.567.567,0,0,0-.142.3Z"
                                                transform="translate(-8 -0.25)" fill='#050505' opacity={0.1} />
                                        </g>
                                        <g>
                                            <rect fill="none" />
                                        </g>
                                    </svg>
                                </div>
                            </NavMenu>
                            :
                            <NavMenu isActive={5 === selectedMenu} onClick={() => handleNavClick(5)}>
                                <div className='menu_icon'>
                                    {selectedMenu === 5 ?
                                        <svg viewBox="0 0 40 40">
                                            <g>
                                                <path d="M18,8H11.25A3.25,3.25,0,0,0,8,11.25v13.5A3.25,3.25,0,0,0,11.25,28h13.5A3.25,3.25,0,0,0,28,24.75V18" transform="translate(1 1)" fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2.5" stroke='#191919' />
                                                <path d="M24,21.718a.524.524,0,0,0,.524.532l1.253-.16a.569.569,0,0,0,.3-.142L37.858,10.158a.753.753,0,0,0-.142-1.029l-.6-.594a.757.757,0,0,0-1.031-.142L24.276,20.174a.567.567,0,0,0-.142.3Z" transform="translate(-8 -0.25)" fill='#191919' />
                                            </g>
                                            <g>
                                                <rect fill="none" />
                                            </g>
                                        </svg>
                                        :
                                        <svg viewBox="0 0 40 40">
                                            <g>
                                                <path d="M18,8H11.25A3.25,3.25,0,0,0,8,11.25v13.5A3.25,3.25,0,0,0,11.25,28h13.5A3.25,3.25,0,0,0,28,24.75V18" transform="translate(1 1)" fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2.5" stroke='#ccc' />
                                                <path d="M24,21.718a.524.524,0,0,0,.524.532l1.253-.16a.569.569,0,0,0,.3-.142L37.858,10.158a.753.753,0,0,0-.142-1.029l-.6-.594a.757.757,0,0,0-1.031-.142L24.276,20.174a.567.567,0,0,0-.142.3Z" transform="translate(-8 -0.25)" fill='#ccc' />
                                            </g>
                                            <g>
                                                <rect fill="none" />
                                            </g>
                                        </svg>
                                    }
                                </div>
                            </NavMenu>
                        }
                    </div>
                    {isMobile && <div className='mb_status' onClick={(e) => { e.preventDefault(); e.stopPropagation(); statusHandle(); }} css={css`
                        background-image : url(${currentUser?.photo});
                    `}></div>}
                </NavBarWrap >
            }
        </>
    );
}