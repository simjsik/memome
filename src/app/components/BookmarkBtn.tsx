/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from "@emotion/styled";
import { auth, db } from "../DB/firebaseConfig";
import { deleteDoc, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { memoList, memoState } from "../state/PostState";

const Bookmark = styled.button`
width : 32px;
height : 32px;
cursor : pointer;
border : none;
background : none;
`

interface PostId {
    postId: string;
    // userId: string;
}
export default function BookmarkBtn({ postId }: PostId) {
    const [currentBookmark, setCurrentBookmark] = useState<boolean>(false)
    const [currentPostData, setCurrentPostData] = useState<any>()
    // state
    const userId = auth.currentUser?.uid;
    useEffect(() => {
        const checkBookmark = async () => {
            if (userId) {
                try {
                    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);
                    const postRef = doc(db, 'posts', postId);

                    const bookmarkDoc = await getDoc(bookmarkRef)
                    const postDoc = await getDoc(postRef)
                    // console.log(bookmarkDoc.exists(), '북마크 확인')

                    if (bookmarkDoc.exists()) {
                        setCurrentBookmark(true);
                    } else {
                        setCurrentBookmark(false);
                    }

                    if (postDoc.exists()) {
                        setCurrentPostData({
                            tag: postDoc.data().tag,
                            title: postDoc.data().title,
                            createAt: postDoc.data().createAt,
                        })
                    } else {
                        setCurrentPostData(null);
                    }

                } catch (error) {
                    console.error('북마크 확인 중 에러', error)
                }
            }
        };

        checkBookmark();
    }, [userId, postId])


    const addBookmark = async (postId: string) => {
        if (!userId) {
            alert('로그인 후 이용 가능합니다!');
            return;
        }

        if (!postId) {
            alert('유효하지 않은 포스트 입니다.')
            return;
        }

        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);

        if (!currentBookmark) {
            setCurrentBookmark(true);
            await setDoc(bookmarkRef, { postId, userId, tag: currentPostData.tag, title: currentPostData.title, createAt: Timestamp.now(), })
            alert('북마크 추가 완료!');
        } else if (currentBookmark) {
            const deleteBookmark = confirm('북마크를 해제 하시겠습니까?')

            if (deleteBookmark) {
                setCurrentBookmark(false);
                await deleteDoc(bookmarkRef)
                alert('북마크가 해제되었습니다.');
            }
        }
    }
    // function
    return (
        <Bookmark onClick={() => addBookmark(postId)}>
            <svg width="32" height="32" viewBox="0 0 39 40">
                <g>
                    {currentBookmark ?
                        <>
                            <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z" fill="#4cc9bf" stroke="#4cc9bf" strokeWidth="2.5">
                            </path>
                            <rect width="32" height="32" fill="none" stroke="none">
                            </rect>
                        </>
                        :
                        <>
                            <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z" fill="none" stroke="#ccc" strokeWidth="2.5">
                            </path>
                            <rect width="32" height="32" fill="none" stroke="none">
                            </rect>
                        </>
                    }
                </g>
            </svg>
        </Bookmark>
    )
}