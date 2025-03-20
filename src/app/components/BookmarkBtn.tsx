/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from "@emotion/styled";
import { db } from "../DB/firebaseConfig";
import { arrayRemove, arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { BookmarkCache, bookMarkState, PostData, userBookMarkState, userState } from "../state/PostState";
import { useQueryClient } from "@tanstack/react-query";
import { FirebaseError } from "firebase/app";
import { motion, useAnimation } from "framer-motion";

const Bookmark = styled.button`
    width : 32px;
    height : 32px;
    cursor : pointer;
    border : none;
    background : none;
    padding : 2px;
`;

interface PostId {
    postId: string;
    // userId: string;
}
export default function BookmarkBtn({ postId }: PostId) {
    const [bookmarked, setBookmarked] = useState<boolean>(false)
    const [currentBookmark, setCurrentBookmark] = useRecoilState<string[]>(bookMarkState)
    const setUserBookmarks = useSetRecoilState<PostData[]>(userBookMarkState)

    const currentUser = useRecoilValue(userState)
    // state

    const controls = useAnimation();

    useEffect(() => {
        const checkBookmark = async () => {
            const isBookmarked = currentBookmark.includes(postId);

            if (isBookmarked) {
                setBookmarked(true)
            } else {
                setBookmarked(false);
            }
        };

        checkBookmark();
    }, [currentUser, postId])

    const queryClient = useQueryClient();

    const addBookmark = async (postId: string) => {
        if (!postId) {
            alert('존재하지 않은 포스트 입니다.')
            return;
        }

        if (currentUser) {
            const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/bookmarkId`);

            const isBookmarked = currentBookmark.includes(postId);

            if (!isBookmarked) {
                setBookmarked(true);
                await updateDoc(bookmarkRef,
                    {
                        bookmarkId: arrayUnion(postId),
                    }).catch(async (error) => {
                        if (error instanceof FirebaseError && error.code === 'not-found') {
                            console.log('북마크 없음. 추가 실행');
                            await setDoc(bookmarkRef, { bookmarkId: [postId] });
                        } else if (error instanceof FirebaseError) {
                            throw new Error(error.message + ' - 북마크 추가 실패');
                        } else {
                            // FirebaseError가 아닌 경우
                            throw new Error('알 수 없는 에러 - 북마크 추가 실패');
                        }
                    })
                alert('북마크 추가 완료!');
                setCurrentBookmark((prev) => [...prev, postId]);
            } else {
                const deleteBookmark = confirm('북마크를 해제 하시겠습니까?')

                if (deleteBookmark) {
                    await updateDoc(bookmarkRef, {
                        bookmarkId: arrayRemove(postId),
                    }); // 배열 형태일 때 현재 포스트 id 삭제.
                    setBookmarked(false);

                    // 북마크 해제 후 북마크 state 업데이트
                    setCurrentBookmark((prev) => prev.filter((id) => id !== postId));

                    // **userBookmarks에서 해당 포스트 제거**
                    setUserBookmarks((prev) =>
                        prev.filter((post) => post.id !== postId)
                    );

                    // 캐싱된 데이터를 수동으로 업데이트
                    queryClient.setQueryData<BookmarkCache>(['bookmarks', currentUser.uid], (oldData) => {
                        // console.log("Before update:", oldData); // 업데이트 이전 데이터 확인
                        if (!oldData) return oldData;

                        const newData = {
                            ...oldData,
                            pages: oldData.pages.map((page) => {
                                // console.log("Before filter:", page.data.pages); // 필터링 전 데이터 확인
                                const filteredData = page.data.filter((post: PostData) => post.id !== postId);
                                // console.log("After filter:", filteredData); // 필터링 후 데이터 확인
                                return { ...page, data: filteredData };
                            }),
                        };

                        // console.log("After update:", newData.pages); // 업데이트 이후 데이터 확인
                        return newData;
                    });

                    alert('북마크가 해제되었습니다.');
                }
            }
        }
    }

    const MotionBookmark = motion(Bookmark);

    // function
    return (
        <MotionBookmark
            as={motion.button}
            whileHover={{
                scale: 1.05,
                backgroundColor: "#3b82f6",
                transition: { duration: 0.3 },
            }}
            whileTap={{
                scale: 0.95,
                rotate: "2deg",
                transition: { duration: 0.1 },
            }}
            onHoverEnd={() => {
                controls.start({
                    scale: [0.95, 1.1, 1],
                    transition: {
                        duration: 1,
                        type: "spring",
                        stiffness: 300,
                        damping: 10
                    }
                });
            }}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); addBookmark(postId); }}>
            <svg width="28" height="28" viewBox="0 0 38 38">
                <g>
                    {bookmarked ?
                        <>
                            <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z" fill="#0087ff" stroke="#0087ff" strokeWidth="2.5">
                            </path>
                            <rect width="28" height="28" fill="none" stroke="none">
                            </rect>
                        </>
                        :
                        <>
                            <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z" fill="none" stroke="#ccc" strokeWidth="2.5">
                            </path>
                            <rect width="28" height="28" fill="none" stroke="none">
                            </rect>
                        </>
                    }
                </g>
            </svg>
        </MotionBookmark>
    )
}