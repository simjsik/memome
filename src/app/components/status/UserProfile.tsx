/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, modalState, noticeList, noticeType, UsageLimitState, UsageLimitToggle, userData, userState } from "@/app/state/PostState";
import styled from "@emotion/styled";
import { deleteDoc, doc } from "firebase/firestore";
import { css, useTheme } from "@emotion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { MyAlarmWrap } from "@/app/styled/PostComponents";
import { useRouter } from "next/navigation";
import { db } from "@/app/DB/firebaseConfig";
import { uploadImgCdn } from "@/app/utils/uploadCdn";
import { motion } from "framer-motion";
import { btnVariants } from "@/app/styled/motionVariant";
import { BeatLoader } from "react-spinners";
import { formatDate } from "@/app/utils/formatDate";
import LoadLoading from "../LoadLoading";


const ProfileWrap = styled.div`
padding-top : 20px;
height : 100%;

// 프로필 상단
.profile_top{
    display: flex;
    width: 100%;
    flex-wrap: wrap;
}

.profile_id{
    flex: 1 0 75%;
    padding: 10px 0px;
}

.user_name{
    font-size: 1.25rem;
    font-family: var(--font-pretendard-bold);
}

.user_uid{
    font-size : 0.875rem;
    color: ${({ theme }) => theme.colors.text_tag};
    font-family: var(--font-pretendard-medium);
}

.user_photo{
    background-size: cover;
    background-position: center;
    min-width: 72px;
    height: 72px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 50%;
}
.update_toggle_btn{
    width: 100%;
    padding: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius : 4px;
    background: ${({ theme }) => theme.colors.background};
    margin-top: 20px;
    cursor: pointer;
    font-size : 0.875rem;
}

// 프로필 하단
.profile_menu_wrap{
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin-top: 20px;
    padding: 20px 0px;
}

.memo_box{
    line-height: 2rem;
    position: relative;
    display: flex;

    p{
        font-size : 0.875rem;
    }
}

.menu_profile{
    -webkit-background-size: cover;
    background-size: cover;
    -webkit-background-position: center;
    background-position: center;
    width: 32px;
    height: 32px;
    margin-right: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 50%;
}

.memo_btn{
    position: absolute;
    right: 0;
    padding: 8px 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    cursor :pointer;
    font-size : 0.75rem;
}

// 프로필 업데이트
.update_wrap{
margin-top : 20px;

    // 이름 변경
    .user_name_change_wrap{
        display: flex;
        flex-wrap: wrap;
        
        >label{
            flex: 1 0 100%;
            font-size: 0.875rem;
        }

        input{
            flex: 0 0 70%;
            margin-right: 8px;
            border: 1px solid ${({ theme }) => theme.colors.border};
            height: 42px;
            margin-top: 8px;
            padding-left: 10px;
            border-radius : 8px;
            font-size : 0.75rem;
        }

        p{
        font-size: 0.75rem;
        margin-top: 36px;
        color: ${({ theme }) => theme.colors.text_tag};
        }
    }
    // --------------------------------------

    // 프로필 사진 변경
    .user_photo_change_wrap{
    display: flex;
    margin-top: 16px;
    font-size: 0.875rem;
    flex-wrap: wrap;

        >label{
            flex: 1 0 100%;
        }

        input[type="file"] {
        display: none; /* 기본 파일 입력 숨기기 */
        }

        .photo_btn_wrap{
            display: flex;
            flex: 0 0 50%;
            margin-top: 10px;
        }

        .photo_update{
                display: block;
                width: 120px;
                height: 40px;
                border: 1px solid ${({ theme }) => theme.colors.border};
                border-radius: 8px;
                background-color: ${({ theme }) => theme.colors.background};
                text-align: center;
                margin-right: 8px;
                cursor: pointer;
                font-size : 0.75rem;
        }

        .photo_reset{
                width: 80px;
                height: 42px;
                padding: 10px;
                border: none;
                background: none;
                text-align: center;
                -webkit-text-decoration: underline;
                font-family: var(--font-pretendard-light);
                cursor: pointer;
                font-size : 0.75rem
        }

        .photo_reset:hover{
            text-decoration : underline;
        }

        .photo_preview{
            width: 62px;
            height: 62px;
            border: 2px solid ${({ theme }) => theme.colors.border};
            border-radius: 50%;
            background-size: cover;
            background-repeat : no-repeat;
            background-position : center;
        }
    }
    // --------------------------------------

    // 변경사항 있을 시 버튼
    .update_btn_wrap{
    margin-top : 40px;
    border : 1px solid ${({ theme }) => theme.colors.border};
    padding : 8px;
    border-radius : 8px;
    text-align : right;
        
        >p{
            font-size: 0.875rem;
        }

        .reset_update_btn{
            padding: 8px 18px;
            border: none;
            background: none; 
            cursor : pointer;
            margin : 12px 8px 0px 0px;
            font-size: 0.75rem;
        }

        .reset_update_btn:hover{
            text-decoration : underline;
        }

        .update_btn{
            padding: 8px 18px;
            border: none;
            background: ${({ theme }) => theme.colors.primary};
            color: #fff;
            border-radius: 8px;
            cursor : pointer; 
            font-size: 0.75rem;
        }
    }
    // --------------------------------------
}


    @media (min-width: 1921px) {
        padding-top: 30px;

        .menu_profile{
            width: 40px;
            height: 40px;
        }

        .memo_btn {
            padding: 8px 16px;
        }
    }

      @media (min-width: 2560px) {
        padding-top: 40px;

        .menu_profile{
            width: 46px;
            height: 46px;
            margin-right: 12px;
        }

        .memo_box{
            .menu_profile{
                width: 48px;
                height: 48px;
                margin-right: 16px;
            }

            .memo_btn{
                padding: 10px 24px;
                border: 2px solid ${({ theme }) => theme.colors.border};
            }
        }

        .user_photo{
            width : 96px;
            height : 96px;
        }

        .profile_menu_wrap {
            margin-top: 36px;
            padding: 32px 0px;
        }

        .update_toggle_btn{
            padding: 10px;
        }

        .update_wrap{
            .user_name_change_wrap,
            .user_photo_change_wrap{
                margin-top : 20px;
            }

            .user_name_change_wrap input {
                border: 2px solid ${({ theme }) => theme.colors.border};
                height: 62px;
                margin-top: 8px;
                padding-left: 10px;
                border-radius: 8px;
            }

            .photo_btn_wrap{
                line-height : 52px;
            }

            .user_photo_change_wrap .photo_update { 
                width: 140px;
                height: 52px;
                border: 2px solid ${({ theme }) => theme.colors.border};
                margin-right: 16px;
            }

            .user_photo_change_wrap .photo_reset {
                width : 92px;
                height: 52px;
            }

            .update_btn_wrap{
                border: 2px solid ${({ theme }) => theme.colors.border};
                padding: 16px;

                .reset_update_btn {
                    font-size: 0.75rem;
                    padding: 16px 24px;
                }

                .update_btn {
                    padding: 16px 32px;
                    font-size: 0.75rem;
                }
            }
        }
    }

    @media (min-width: 3840px) {
        padding-top: 50px;

        .menu_profile{
            width: 52px;
            height: 52px;
            margin-right: 12px;
        }

        .user_photo{
            width : 120px;
            height : 120px;
        }

        .profile_menu_wrap {
            margin-top: 42px;
            padding: 32px 0px;
        }

        .memo_box{
            .menu_profile{
                width: 64px;
                height: 64px;
                margin-right: 20px;
            }

            .memo_btn{
                padding: 14px 32px;
                border: 3px solid ${({ theme }) => theme.colors.border};
            }
        }

        .update_toggle_btn{
            padding: 12px;
            border: 3px solid ${({ theme }) => theme.colors.border};
        }

        .update_wrap{

            .user_name_change_wrap,
            .user_photo_change_wrap{
                margin-top : 40px;
            }

            .user_name_change_wrap input {
                border: 3px solid ${({ theme }) => theme.colors.border};
                height: 76px;
                margin-top: 8px;
                padding-left: 10px;
                border-radius: 8px;
            }

            .photo_btn_wrap{
                line-height : 68px;
            }

            .user_photo_change_wrap .photo_update { 
                width: 140px;
                height: 68px;
                border: 3px solid ${({ theme }) => theme.colors.border};
                margin-right: 16px;
            }

            .user_photo_change_wrap .photo_reset {
                width : 112px;
                height: 68px;
            }

            .user_photo_change_wrap .photo_preview {
                width: 68px;
                height: 68px;
                border: 3px solid ${({ theme }) => theme.colors.border};
                margin-top: 10px;
            }

            .update_btn_wrap{
                margin-top: 60px;
                border: 3px solid ${({ theme }) => theme.colors.border};
                padding: 20px;

                .reset_update_btn {
                    padding: 20px 28px;
                }

                .update_btn {
                    padding: 20px 36px;
                }
            }
        }
    }
        
    @media (min-width: 5120px) {
        padding-top: 60px;

        .memo_box{
            .menu_profile{
                width: 78px;
                height: 78px;
                margin-right: 24px;
            }

            .memo_btn{
                padding: 18px 40px;
            }
        }

        .user_photo{
            width : 138px;
            height : 138px;
        }
        .profile_menu_wrap {
            margin-top: 40px;
            padding: 40px 0px;
        }

        .update_toggle_btn{
            padding: 16px;
        }

        .update_wrap{
            .user_name_change_wrap,
            .user_photo_change_wrap{
                margin-top : 60px;
            }

            .user_name_change_wrap input {
                height: 86px;
                margin-top: 12px;
                padding-left: 10px;
                border-radius: 8px;
            }

            .photo_btn_wrap{
                line-height : 76px;
            }

            .user_photo_change_wrap .photo_update { 
                width: 180px;
                height: 76px;
                margin-right: 24px;
            }

            .user_photo_change_wrap .photo_reset {
                width : 132px;
                height: 76px;
            }

            .user_photo_change_wrap .photo_preview {
                width: 76px;
                height: 76px;
            }

            .update_btn_wrap{
                margin-top: 80px;
                padding: 24px;

                .reset_update_btn {
                    padding: 24px 32px;
                }

                .update_btn {
                    padding: 24px 40px;
                }
            }
        }
    }
`

export default function UserProfile() {
    const theme = useTheme();
    const [currentUser, setCurrentUser] = useRecoilState<userData>(userState)
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const [noticeLists, setNoticeLists] = useRecoilState<noticeType[]>(noticeList);
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    const [updateToggle, setUpdateToggle] = useState<boolean>(false)
    const [updateUserName, setUpdateUserName] = useState<string | null>(null)
    const [updateUserNameError, setUpdateUserNameError] = useState<string | null>(null)
    const [updateUserPhoto, setUpdateUserPhoto] = useState<File | null>(null)
    const [updateUserPhotoError, setUpdateUserPhotoError] = useState<string | null>(null)
    const [updateUserPhotoPreview, setUpdateUserPhotoPreview] = useState<string | null>(currentUser.photo)
    const [loading, setLoading] = useState(false);
    const [alarmLoading, setAlarmLoading] = useState(false);
    const [routed, setRouted] = useState<boolean>(false);

    // state
    const updatePhotoRef = useRef<HTMLInputElement | null>(null)
    // ref
    const router = useRouter();

    // File 타입을 base64로 변경하기 위한 함수
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // 프로필 사진 업데이트 시 로직
    const updateToProfile = async (image: File | null, name: string | null) => {
        if (currentUser) {
            try {
                setLoading(true);

                let profileImageUrl = currentUser.photo
                let userProfileDate
                const uid = currentUser.uid
                if (image) {
                    // 받아온 image인자가 File 타입이기 때문에 Cloudinary에 저장을 위해 base64로 변경
                    const base64Image = await fileToBase64(image);

                    const validateResponse = await fetch(`/api/validate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: "include",
                        body: JSON.stringify({ uid }),
                    });
                    if (!validateResponse.ok) {
                        const errorDetails = await validateResponse.json();
                        throw new Error(`유저 검증 실패: ${errorDetails.message}`);
                    }

                    // 변경된 이미지가 있을 시 업데이트
                    if (base64Image) {
                        // 받아온 image인자가 File 타입이기 때문에 Cloudinary에 저장을 위해 base64로 변경
                        const cdnImg = await uploadImgCdn(base64Image)

                        if (cdnImg.imgUrl) {
                            const profileImg = cdnImg.imgUrl
                            profileImageUrl = profileImg;
                        }
                    }
                    const UpdateResponse = await fetch(`/api/updateProfile`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: "include",
                        body: JSON.stringify({ uid, image: profileImageUrl, name }),
                    });

                    if (!UpdateResponse.ok) {
                        const errorDetails = await UpdateResponse.json();
                        throw new Error(`유저 업데이트 실패: ${errorDetails.message}`);
                    }

                    userProfileDate = {
                        name: name,
                        photo: profileImageUrl,
                        email: currentUser.email,
                        uid: uid
                    };

                    setCurrentUser(userProfileDate)
                    setUpdateToggle(false);
                    alert('프로필 업데이트 성공!')
                    return;
                }

                const UpdateResponse = await fetch(`/api/updateProfile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include",
                    body: JSON.stringify({ uid, image: profileImageUrl, name }),
                });

                if (!UpdateResponse.ok) {
                    const errorDetails = await UpdateResponse.json();
                    throw new Error(`유저 업데이트 실패: ${errorDetails.message}`);
                }

                userProfileDate = {
                    name: name,
                    photo: profileImageUrl,
                    email: currentUser.email,
                    uid: uid
                };

                setCurrentUser(userProfileDate)
                setUpdateToggle(false);
                alert('프로필 업데이트 성공!')
                return;
            } catch (error) {
                alert('프로필 사진 업로드에 실패' + error)
            } finally {
                setLoading(false);
            }
        }

    }

    // 유저 프로필 사진 변경 시 설정
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) {
                setUpdateUserPhotoError("이미지만 업로드할 수 있습니다.");
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setUpdateUserPhotoError('이미지 크기는 2MB를 초과 할 수 없습니다.')
                return;
            }

            const imageUrl = URL.createObjectURL(file);
            setUpdateUserPhotoPreview(imageUrl)
            setUpdateUserPhoto(e.target.files[0]);
        }
    }

    const handleResetPhoto = () => {
        setUpdateUserPhotoPreview('https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744861940/%ED%94%84%EB%A1%9C%ED%95%84%EC%9A%A9_grt1en.png'); // 기본 이미지 URL 적용
        setUpdateUserPhoto(null);  // 선택된 파일 초기화
    };

    // 유저 별명 변경 시 설정
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.value.length > 12) {
            setUpdateUserNameError('별명은 최대 12자 이내로 가능합니다.')
        }

        if (e.target.value.length > 18) {
            return;
        }

        setUpdateUserName(e.target.value)
    }

    const handleProfileReset = () => {
        if (currentUser && currentUser.name) {
            setUpdateUserName(currentUser.name)
            setUpdateUserPhoto(null)
            setUpdateUserNameError(null)
            setUpdateUserPhotoError(null)
            setUpdateUserPhotoPreview(currentUser.photo)
        }

        if (updatePhotoRef.current) {
            updatePhotoRef.current.value = ''; // 선택된 사진 초기화
        }
    }

    const noticeConfirm = async (noticeId: string) => {
        if (alarmLoading) {
            return;
        }
        if (currentUser) {
            try {
                setAlarmLoading(true);
                const uid = currentUser.uid

                // 유저 검증
                const ValidateResponse = await fetch(`/api/validate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uid }),
                });

                if (!ValidateResponse.ok) {
                    const errorData = await ValidateResponse.json()
                    throw new Error('유저 확인 중 오류가 발생했습니다.', errorData.message);
                }

                const noticeDoc = await doc(db, `users/${uid}/noticeList/${noticeId}`);

                if (!noticeDoc) {
                    alert('해당 게시글을 찾을 수 없습니다.')
                    return;
                }

                // 삭제 권한 확인
                await deleteDoc(noticeDoc);

                // noticeLists 상태에서 해당 알림 제거
                setNoticeLists((prevNotices) =>
                    prevNotices.filter((notice) => notice.noticeId !== noticeId)
                );
            } catch (error) {
                console.error('게시글 삭제 중 오류가 발생했습니다.' + error)
                alert('게시글 삭제 중 오류가 발생했습니다.')
            } finally {
                setAlarmLoading(false);
            }
        } else {
            console.error('유저 확인 실패')
        }
    }

    const handleUpdateToggle = () => {
        if (yourLogin && !usageLimit) {
            setUpdateToggle((prev) => !prev)
        } else if (usageLimit) {
            return setLimitToggle(true);
        } else {
            setLoginToggle(true);
            setModal(true);
            return;
        }
    }

    const handleMemoClick = () => {
        if (yourLogin && !usageLimit) {
            setRouted(true);
            setTimeout(() => {
                startTransition(() => {
                    router.push('/home/post');
                });
            }, 0);

        } else if (usageLimit) {
            return setLimitToggle(true);
        } else {
            setLoginToggle(true);
            setModal(true);
            return;
        }
    }

    useEffect(() => {
        if (updateToggle && currentUser) {
            setUpdateUserName(currentUser.name)
        }
    }, [updateToggle])

    useEffect(() => {
        handleProfileReset();
    }, [currentUser])

    return (
        <ProfileWrap>
            {/* 프로필 상단 */}
            {routed && <LoadLoading />}
            <div className="profile_top">
                <div className="profile_id">
                    <p className="user_name">{currentUser.name}</p>
                    <span className="user_uid">
                        @{currentUser.uid?.slice(0, 8)}...
                    </span>
                </div>
                <div className="user_photo" css={css`
                        background-image : url(${currentUser.photo});
                        background-size : cover;
                        background-position : center;
                        width : 72px;
                        height : 72px;
                        border : 1px solid ${theme.colors.border};
                        border-radius : 50%;
                    `}></div>
                <motion.button
                    variants={btnVariants(theme)}
                    whileHover="otherHover"
                    whileTap="otherClick" className="update_toggle_btn" onClick={handleUpdateToggle}>
                    {updateToggle ?
                        '프로필 수정 취소'
                        :
                        '프로필 수정'
                    }
                </motion.button>
            </div>
            {
                updateToggle ?
                    <>
                        {/* 프로필 업데이트 구조 */}
                        <div className="update_wrap">
                            <div className="update_box">
                                <div className="user_name_change_wrap">
                                    <label>별명</label>
                                    <input onChange={handleNameChange} type="text" value={updateUserName || ''} placeholder={currentUser.name || '새 유저 별명'} />
                                    <p>{updateUserName?.length}/12</p>
                                </div>
                                <span className="update_error">{updateUserNameError}</span>
                                <div className="user_photo_change_wrap">
                                    <label>사진</label>
                                    <div className="photo_btn_wrap">
                                        <motion.label
                                            variants={btnVariants(theme)}
                                            whileHover="otherHover"
                                            whileTap="otherClick" className="photo_update" htmlFor={'photo_input'}>사진 변경</motion.label>
                                        <motion.button
                                            whileHover={{
                                                textDecoration: "underline",
                                            }}
                                            className="photo_reset" onClick={handleResetPhoto}>사진 제거</motion.button>
                                    </div>
                                    <div className="photo_preview" css={css`background-image : url(${updateUserPhotoPreview})`}></div>
                                    <input id="photo_input" ref={updatePhotoRef} onChange={handlePhotoChange} type="file" accept="image/*" />
                                </div>
                                <span className="update_error">{updateUserPhotoError}</span>
                                {/* 업데이트 감지 시 버튼 */}
                                {(updateUserName !== currentUser.name || Boolean(updateUserPhoto) || updateUserPhotoPreview !== currentUser.photo) &&
                                    <div className="update_btn_wrap">
                                        <p>저장하지 않은 변경 사항이 있습니다!</p>
                                        <button className="reset_update_btn" onClick={handleProfileReset}>
                                            되돌리기
                                        </button>
                                        {loading ?
                                            <motion.button className="update_btn">
                                                <BeatLoader color="#fff" size={8} />
                                            </motion.button>
                                            : <motion.button
                                                variants={btnVariants(theme)}
                                                whileHover="loginHover"
                                                whileTap="loginClick" className="update_btn" onClick={(e) => { e.preventDefault(); updateToProfile(updateUserPhoto, updateUserName); }}>
                                                변경 사항 적용
                                            </motion.button>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </>
                    :
                    <>
                        {/* 프로필 하단 메뉴*/}
                        < div className="profile_menu_wrap">
                            <div className="memo_box">
                                <div className="menu_profile" css={css`
                                    background-image : url(${currentUser.photo});
                                    background-size : cover;
                                    background-position : center;
                                    width : 32px;
                                    height : 32px;
                                    border : 1px solid ${theme.colors.border};
                                    border-radius : 50%;
                                `}></div>
                                <p>새 메모를 작성하세요</p>
                                <motion.button
                                    variants={btnVariants(theme)}
                                    whileHover="otherHover"
                                    whileTap="otherClick" className="memo_btn" onClick={handleMemoClick}>메모</motion.button>
                            </div>
                            <MyAlarmWrap className="my_alarm_wrap">
                                <Swiper
                                    spaceBetween={100} // 슬라이드 간격
                                    slidesPerView={3.5} // 화면에 보이는 슬라이드 개수
                                    freeMode={true}
                                    pagination={{
                                        clickable: true,
                                    }}
                                    navigation={true}
                                >
                                    {noticeLists.map((notice) => (
                                        <SwiperSlide key={notice.noticeId}>
                                            <div className="my_alarm">
                                                <h2>알림</h2>
                                                <div className="alarm_title">
                                                    <p>{notice.noticeType}</p>
                                                </div>
                                                <time className="alram_date">{formatDate(notice.noticeAt)}</time>
                                                {alarmLoading ?
                                                    <button><BeatLoader color="#000" size={8} /></button>
                                                    :
                                                    <motion.button
                                                        variants={btnVariants(theme)}
                                                        whileHover="loginHover"
                                                        whileTap="loginClick" onClick={() => noticeConfirm(notice.noticeId)}>알림 확인</motion.button>
                                                }

                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </MyAlarmWrap>
                        </div>
                    </>

            }
        </ProfileWrap >
    )
}