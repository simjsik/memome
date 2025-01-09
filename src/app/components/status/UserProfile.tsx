/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ADMIN_ID, DidYouLogin, noticeList, noticeType, PostData, userData, userState } from "@/app/state/PostState";
import styled from "@emotion/styled";
import { auth, db } from "@/app/DB/firebaseConfig";
import { updateProfile } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { css } from "@emotion/react";

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
    font-size: 24px;
    font-family: var(--font-pretendard-bold);
}

.user_uid{
    color: #555;
    font-family: var(--font-pretendard-medium);
}

.user_photo{
    background-size: cover;
    background-position: center;
    min-width: 72px;
    height: 72px;
    border: 1px solid #ededed;
    border-radius: 50%;
}
.update_toggle_btn{
    width: 100%;
    padding: 8px;
    border: 1px solid #ededed;
    background: #fff;
    margin-top: 20px;
}

// 프로필 하단
.profile_menu_wrap{
    border-top: 1px solid #ededed;
    margin-top: 20px;
    padding: 20px 0px;
}

.memo_box{
    position: relative;
    display: flex;

    p{
    line-height : 32px;
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
    border: 1px solid #ededed;
    border-radius: 50%;
}

.memo_btn{
    position: absolute;
    right: 0;
    padding: 4px 10px;
    border: 1px solid #ededed;
    background: #fff;
}

// 프로필 업데이트
.update_wrap{
margin-top : 20px;

    // 이름 변경
    .user_name_change_wrap{
        display: flex;
        flex-wrap: wrap;
        
        label{
        flex: 1 0 100%;
        font-size: 14px;
        }

        input{
        flex: 0 0 70%;
        margin-right: 8px;
        border: 1px solid #ededed;
        height: 42px;
        margin-top: 8px;
        padding-left: 10px;
        }

        p{
        font-size: 12px;
        margin-top: 36px;
        color: #777;
        }
    }
    // --------------------------------------

    // 프로필 사진 변경
    .user_photo_change_wrap{
    display: flex;
    margin-top: 16px;
    font-size: 14px;
    flex-wrap: wrap;

        label:first-child{
        flex: 1 0 100%;
        }

        input[type="file"] {
        display: none; /* 기본 파일 입력 숨기기 */
        }

        .photo_btn_wrap{
        display : flex;
        flex: 1 0 100%;
        margin-top : 10px;

            .photo_update{
            display: block;
            flex : 0 0 40%;
            padding: 10px;
            border: 1px solid #ededed;
            border-radius: 8px;
            background-color : #fff;
            text-align: center;
            margin-right : 8px;
            cursor:pointer
            }

            .photo_reset{
            flex : 0 0 30%;
            padding: 10px;
            border: none;
            background : none;
            line-height : 18px;
            text-align: center;
            cursor:pointer
            }

            .photo_reset:hover{
            text-decoration : underline;
            }
        }

    }
    // --------------------------------------

    // 변경사항 있을 시 버튼
    .update_btn_wrap{
    margin-top : 40px;
    border : 1px solid #ededed;
    padding : 8px;
    border-radius : 8px;
    text-align : right;

        .reset_update_btn{
        padding: 8px 18px;
        border: none;
        background: none; 
        cursor : pointer;
        margin : 12px 8px 0px 0px;
        }

        .reset_update_btn:hover{
        text-decoration : underline;
        }

        .update_btn{
        padding: 8px 18px;
        border: none;
        background: #333;
        color: #fff;
        border-radius: 8px;
        cursor : pointer; 
        }
    }
    // --------------------------------------
}


`
interface MyPostListProps {
    post: PostData[];
}

export default function UserProfile() {
    const user = useRecoilValue<userData | null>(userState)
    const [myPostList, setMyPostList] = useState<PostData[]>([])
    const [updateToggle, setUpdateToggle] = useState<boolean>(false)
    const [userEmail, setUserEmail] = useState<string | null>('')
    const [updateUserName, setUpdateUserName] = useState<string>('')
    const [updateUserPhoto, setUpdateUserPhoto] = useState<File | null>(null)
    const [userName, setUserName] = useState<string | null>(null)
    const [userPhoto, setUserPhoto] = useState<string | null>(null)
    const [loading, setLoading] = useState(false);
    const [noticeLists, setNoticeLists] = useRecoilState<noticeType[]>(noticeList);
    const ADMIN = useRecoilValue(ADMIN_ID)
    // state
    const updatePhotoRef = useRef<HTMLInputElement | null>(null)
    // ref
    const my = auth.currentUser

    useEffect(() => {
        if (user) {
            setUserName(user.name)
            setUserEmail(user.email)
            setUserPhoto(user.photo)
        }
    }, [user])

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
        if (my && user) {
            try {
                let profileImageUrl = null

                // 변경된 이미지가 있을 시 업데이트
                if (image) {
                    // 받아온 image인자가 File 타입이기 때문에 Cloudinary에 저장을 위해 base64로 변경
                    const base64Image = await fileToBase64(image);

                    const response = await fetch('/api/uploadToCloudinary', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ image: base64Image }),
                    });

                    if (!response.ok) {
                        throw new Error('프로필 사진 업로드 실패!');
                    }

                    const data = await response.json();
                    if (data.url) {
                        profileImageUrl = data.url;
                    } else {
                        throw new Error('Cloudinary의 이미지 반환 실패')
                    }
                } else {
                    profileImageUrl = my.photoURL;
                }

                // Firebase Authentication의 프로필 업데이트
                await updateProfile(my, {
                    displayName: name || user.name,
                    photoURL: profileImageUrl || user.photo,
                })

                // 업데이트한 프로필 Firestore에 저장
                await setDoc(
                    doc(db, 'users', my.uid), {
                    displayName: name || user.name,
                    photoURL: profileImageUrl || user.photo,
                },
                    { merge: true }
                );

                setUserName(name)
                setUserPhoto(profileImageUrl)
                alert('프로필 업데이트 성공!')
            } catch (error) {
                alert('프로필 사진 업로드에 실패' + error)
            }
        }

    }

    // 유저 프로필 사진 변경 시 설정
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (e.target.files[0].size > 2 * 1024 * 1024) {
                alert('이미지 크기는 2MB를 초과 할 수 없습니다.')
                return
            } else {
                setUpdateUserPhoto(e.target.files[0]);
            }
        }
        setLoading(true);
    }

    // 유저 별명 변경 시 설정
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.target.value.length > 12) {
            alert('별명은 최대 12자 이내로 가능합니다.')
            setUpdateUserName(e.target.value)
            return
        }
        setUpdateUserName(e.target.value)
        setLoading(true);
    }

    const handleProfileReset = () => {
        if (userName && userPhoto) {
            setUpdateUserName(userName)
            setUpdateUserPhoto(null)
        }

        if (updatePhotoRef.current) {
            updatePhotoRef.current.value = ''; // 선택된 사진 초기화
        }
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

    const noticeConfirm = async (noticeId: string) => {
        if (my) {
            try {
                // 게시글 존재 확인
                const noticeDoc = await getDoc(doc(db, 'users', my.uid, 'noticeList', noticeId));
                if (!noticeDoc.exists()) {
                    alert('해당 게시글을 찾을 수 없습니다.')
                    return;
                }
                // 삭제 권한 확인
                await deleteDoc(doc(db, 'users', my.uid, 'noticeList', noticeId));
                console.log('알림 확인')

                // noticeLists 상태에서 해당 알림 제거
                setNoticeLists((prevNotices) =>
                    prevNotices.filter((notice) => notice.noticeId !== noticeId)
                );
            } catch (error) {
                console.error('게시글 삭제 중 오류가 발생했습니다.' + error)
                alert('게시글 삭제 중 오류가 발생했습니다.')
            }
        } else {
            console.log('유저 확인 실패')
        }
    }

    console.log(noticeLists)
    return (
        <ProfileWrap>
            {/* 프로필 상단 */}
            <div className="profile_top">
                <div className="profile_id">
                    <p className="user_name">{userName}</p>
                    <span className="user_uid">
                        {userEmail}
                    </span>
                </div>
                <div className="user_photo" css={css`
                        background-image : url(${userPhoto});
                        background-size : cover;
                        background-position : center;
                        width : 72px;
                        height : 72px;
                        border : 1px solid #333;
                        border-radius : 50%;
                    `}></div>
                <button className="update_toggle_btn" onClick={() => setUpdateToggle((prev) => !prev)}>
                    {updateToggle ?
                        '프로필 수정 취소'
                        :
                        '프로필 수정'
                    }
                </button>
            </div>
            {
                updateToggle ?
                    <>
                        {/* 프로필 업데이트 구조 */}
                        <div className="update_wrap">
                            <div className="update_box">
                                <div className="user_name_change_wrap">
                                    <label>별명</label>
                                    <input onChange={handleNameChange} type="text" value={updateUserName || ''} placeholder={userName || '새 유저 별명'} />
                                    <p>{updateUserName?.length}/12</p>
                                </div>
                                <div className="user_photo_change_wrap">
                                    <label>사진</label>
                                    <div className="photo_btn_wrap">
                                        <label className="photo_update" htmlFor={'photo_input'}>사진 변경</label>
                                        <button className="photo_reset">사진 제거</button>
                                    </div>
                                    <input id="photo_input" ref={updatePhotoRef} onChange={handlePhotoChange} type="file" accept="image/*" />
                                </div>
                                {/* 업데이트 감지 시 버튼 */}
                                {(updateUserName !== userName || Boolean(updateUserPhoto)) &&
                                    <div className="update_btn_wrap">
                                        <p>{loading ? '변경 사항이 있습니다!' : ''}</p>
                                        <button className="reset_update_btn" onClick={handleProfileReset}>
                                            되돌리기
                                        </button>
                                        <button className="update_btn" onClick={(e) => { e.preventDefault(); updateToProfile(updateUserPhoto, updateUserName); }}>
                                            변경 사항 적용
                                        </button>
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
                                    background-image : url(${userPhoto});
                                    background-size : cover;
                                    background-position : center;
                                    width : 32px;
                                    height : 32px;
                                    border : 1px solid #333;
                                    border-radius : 50%;
                                `}></div>
                                <p>새 메모를 작성하세요</p>
                                <button className="memo_btn">메모</button>
                            </div>
                            <div className="my_alarm_wrap">
                                {noticeLists.map((notice) => (
                                    <div key={notice.noticeId}>
                                        <p>{notice.noticeId}</p>
                                        <p>{notice.noticeText}</p>
                                        <p>{notice.noticeType}</p>
                                        <p>{formatDate(notice.noticeAt)}</p>
                                        <button onClick={() => noticeConfirm(notice.noticeId)}>알림 확인</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>

            }
        </ProfileWrap >
    )
}