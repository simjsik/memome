/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { DidYouLogin, userState } from "@/app/state/PostState";
import styled from "@emotion/styled";
import { auth, db } from "@/app/DB/firebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const ProfileWrap = styled.div`
height : 100%;

profile_top{
height : 100%;
}
`

export default function UserProfile() {
    const user = useRecoilValue<string | null>(userState)
    const [updateToggle, setUpdateToggle] = useState<boolean>(true)
    const [updateUserName, setUpdateUserName] = useState<string>('')
    const [updateUserPhoto, setUpdateUserPhoto] = useState<File | null>(null)
    const [userName, setUserName] = useState<string | null>(null)
    const [userPhoto, setUserPhoto] = useState<string | null>(null)
    const [loading, setLoading] = useState(false);
    // state

    const updatePhotoRef = useRef<HTMLInputElement | null>(null)
    // ref


    useEffect(() => {
        if (auth.currentUser) {
            const userName = auth.currentUser.displayName
            const userPhoto = auth.currentUser.photoURL
            if (userName) {
                setUserName(userName)
                setUpdateUserName(userName)
            } else {
                setUserName('유저' + auth.currentUser.uid.slice(0, 5))
            }

            if (userPhoto) {
                setUserPhoto(userPhoto)
            } else {
                setUserPhoto('')
            }
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
        if (auth.currentUser) {
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
                }

                // Firebase Authentication의 프로필 업데이트
                await updateProfile(auth.currentUser, {
                    displayName: name || auth.currentUser.displayName,
                    photoURL: profileImageUrl || auth.currentUser.photoURL,
                })

                await setDoc(
                    doc(db, 'users', auth.currentUser.uid), {
                    displayName: name || auth.currentUser.displayName,
                    photoURL: profileImageUrl || auth.currentUser.photoURL,
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
    return (
        <ProfileWrap>
            <div className="profile_top">
                <div className="profile_id">
                    <p className="user_name">{userName}</p>
                    <span className="user_uid">
                        {user}
                    </span>
                </div>
                <div className="user_photo"></div>
            </div>
            <button className="update_profile_btn">프로필 수정</button>
            <div className="update_wrap">
                <div className="update_box">
                    <form onSubmit={(e) => { e.preventDefault(); updateToProfile(updateUserPhoto, updateUserName); }}>
                        <div className="user_name_change_wrap">
                            <label>별명</label>
                            <input onChange={handleNameChange} type="text" value={updateUserName || ''} placeholder={userName || '새 유저 별명'} />
                        </div>
                        <div className="user_photo_change_wrap">
                            <label>프로필 사진</label>
                            <input ref={updatePhotoRef} onChange={handlePhotoChange} type="file" accept="image/*" />
                        </div>
                        {(updateUserName !== userName || Boolean(updateUserPhoto)) &&
                            <>
                                <p>{loading ? '변경 사항이 있습니다!' : ''}</p>
                                <button onClick={handleProfileReset}>
                                    되돌리기
                                </button>
                                <button type="submit">
                                    변경 사항 적용
                                </button>
                            </>
                        }
                    </form>
                </div>
            </div>
        </ProfileWrap>
    )
}