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
import { motion } from "framer-motion";
import { btnVariants } from "../styled/motionVariant";
import { css, Theme, useTheme } from "@emotion/react";

const Bookmark = styled.button`
    width : 32px;
    height : 32px;
    cursor : pointer;
    border : none;
    border-radius: 50px;
    background : ${({ theme }) => theme.colors.background_invisible};
    padding : 2px;

    @media (min-width: 1921px) {
        width: clamp(32px, calc(32px + (100vw - 1921px) * 0.0125195618153365), 40px);
        height: clamp(32px, calc(32px + (100vw - 1921px) * 0.0125195618153365), 40px);

        svg{
            width: 100%;
            height: 100%;
        }
    }
    @media (min-width: 2560px) {
        width: clamp(40px, calc(40px + (100vw - 2560px) * 0.0125), 56px);
        height: clamp(40px, calc(40px + (100vw - 2560px) * 0.0125), 56px);
    }
    @media (min-width: 3840px) {
        width: clamp(56px, calc(32px + (100vw - 3840px) * 0.0125), 72px);
        height: clamp(56px, calc(32px + (100vw - 3840px) * 0.0125), 72px);
    }
    @media (min-width: 5120px) {
        width: clamp(72px, calc(72px + (100vw - 5120px) * 0.0125), 88px);
        height: clamp(72px, calc(72px + (100vw - 5120px) * 0.0125), 88px);
    }
`;

interface PostId {
    postId: string;
    // userId: string;
}
export default function BookmarkBtn({ postId }: PostId) {
    const [bookmarked, setBookmarked] = useState<boolean>(false)
    const [currentBookmark, setCurrentBookmark] = useRecoilState<string[] | null>(bookMarkState)
    const setUserBookmarks = useSetRecoilState<PostData[]>(userBookMarkState)
    const currentUser = useRecoilValue(userState)
    const theme = useTheme();
    // state

    useEffect(() => {
        const checkBookmark = async () => {
            const bookmarkList = currentBookmark ?? [];
            const isBookmarked = bookmarkList.includes(postId);

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
            const bookmarkList = currentBookmark ?? [];
            const isBookmarked = bookmarkList.includes(postId);

            if (!isBookmarked) {
                setBookmarked(true);
                await updateDoc(bookmarkRef,
                    {
                        bookmarkId: arrayUnion(postId),
                    }).catch(async (error) => {
                        if (error instanceof FirebaseError && error.code === 'not-found') {
                            await setDoc(bookmarkRef, { bookmarkId: [postId] });
                        } else if (error instanceof FirebaseError) {
                            throw new Error(error.message + ' - 북마크 추가 실패');
                        } else {
                            // FirebaseError가 아닌 경우
                            throw new Error('알 수 없는 에러 - 북마크 추가 실패');
                        }
                    })
                setCurrentBookmark((prev) => [...(prev ?? []), postId]);
            } else {
                await updateDoc(bookmarkRef, {
                    bookmarkId: arrayRemove(postId),
                }); // 배열 형태일 때 현재 포스트 id 삭제.
                setBookmarked(false);

                // 북마크 해제 후 북마크 state 업데이트
                setCurrentBookmark((prev) => prev ? prev.filter((id) => id !== postId) : []);

                // **userBookmarks에서 해당 포스트 제거**
                setUserBookmarks((prev) =>
                    prev.filter((post) => post.id !== postId)
                );

                // 캐싱된 데이터를 수동으로 업데이트
                queryClient.setQueryData<BookmarkCache>(['bookmarks', currentUser.uid], (oldData) => {
                    if (!oldData) return oldData;

                    const newData = {
                        ...oldData,
                        pages: oldData.pages.map((page) => {
                            const filteredData = page.data.filter((post: PostData) => post.id !== postId);
                            return { ...page, data: filteredData };
                        }),
                    };
                    return newData;
                });
            }
        }
    }

    const MotionBookmark = motion(Bookmark);

    const pathVariants = (theme: Theme) => ({
        offHover: { fill: theme.colors.background_invisible, stroke: theme.colors.text, transition: { duration: 0.3 } },
        onHover: { fill: theme.colors.primary, stroke: theme.colors.primary, transition: { duration: 0.3 } },
    });

    // function
    return (
        <MotionBookmark
            as={motion.button}
            variants={btnVariants(theme)}
            whileHover="iconWrapHover"
            whileTap="iconWrapClick"
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); addBookmark(postId); }}>
            <motion.svg width="28" height="28" viewBox="0 0 38 38">
                <g>
                    {bookmarked ?
                        <>
                            <motion.path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z"
                                css={css`fill: ${theme.colors.primary}; stroke: ${theme.colors.primary}; stroke-width:2;`}
                                variants={pathVariants(theme)}
                                whileHover="onHover"
                            >
                            </motion.path>
                            <rect width="28" height="28" fill="none" stroke="none">
                            </rect>
                        </>
                        :
                        <>
                            <motion.path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z"
                                css={css`fill: ${theme.colors.background_invisible}; stroke: ${theme.colors.text}; stroke-width:2;`}
                                variants={pathVariants(theme)}
                                whileHover="offHover"
                            >
                            </motion.path>
                            <rect width="28" height="28" fill="none" stroke="none">
                            </rect>
                        </>
                    }
                </g>
            </motion.svg>
        </MotionBookmark>
    )
}