/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { auth, db } from "@/app/DB/firebaseConfig";
import { ADMIN_ID, BookmarkPostData, bookMarkState } from "@/app/state/PostState";
import { PostListStyle } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

interface ClientBookmarkProps {
    bookmark: BookmarkPostData[]
}

const BookmarkAllBtn = css`
padding: 6px;
margin-right : 6px;
border : 1px solid #ededed;
background : none;
cursor: pointer;
`

const BottomBtnWrap = css`
display: flex;
justify-content: space-between;
margin-top: 16px;
line-height : 48px;

.bookmark_select_delete_btn{
padding: 6px;
margin-right : 6px;
border : 1px solid #ededed;
background : #4cc9bf;
cursor: pointer;
color : #fff
}
`
export default function Bookmark({ bookmark }: ClientBookmarkProps) {
    const ADMIN = useRecoilValue(ADMIN_ID);
    const [bookmarkedPosts, setBookmarkedPosts] = useRecoilState<BookmarkPostData[]>(bookMarkState);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [selectBookmark, setSelectBookmark] = useState<string[]>([])
    const router = useRouter();
    const user = auth.currentUser?.uid;
    // state    
    useEffect(() => {
        setBookmarkedPosts(bookmark);
    }, [bookmark])

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

    // 북마크 전체 선택
    const handleSelectAll = () => {
        setSelectAll((prev) => !prev);

        if (!selectAll) {
            const allBookmark = bookmarkedPosts.map((post) => post.id);
            setSelectBookmark(allBookmark)
        } else {
            setSelectBookmark([])
        }
    }

    // 북마크 선택
    const handleBookmarkSelect = (postId: string) => {
        if (selectBookmark.includes(postId)) {
            setSelectBookmark((prev) => prev.filter((id) => id !== postId));
        } else {
            setSelectBookmark((prev) => [...prev, postId])
        }
    }

    const clickBookmark = (postId: string) => {
        router.push(`/home/memo/${postId}`)
    }

    const deleteBookmark = async (postId: string | string[]) => {
        if (user) {

            const bookmarks = Array.isArray(postId) ? postId : [postId];


            if (confirm('해당 북마크를 취소 하시겠습니까?')) {
                try {
                    await Promise.all(
                        bookmarks.map(async (postId) => {
                            const postDoc = await getDoc(doc(db, 'users', user, 'bookmarks', postId));
                            const bookmarkOwnerId = postDoc.data()?.userId;

                            if (user === bookmarkOwnerId) {
                                await deleteDoc(doc(db, 'users', user, 'bookmarks', postId))
                            } else {
                                return alert('권한이 없습니다.');
                            }
                        })
                    )
                } catch (error) {
                    console.error('북마크 삭제 중 오류 발생:', error);
                    alert(error || '북마크 삭제 중 오류가 발생했습니다.');
                }
                alert('북마크가 해제되었습니다.')
                router.refresh();
            } else {
                return;
            }
        }
    }

    //function
    useEffect(() => {
        if (!bookmark) return;
        if (user) {
            const bookmarkRef = collection(db, 'users', user, 'bookmarks');
            const Q = query(bookmarkRef, orderBy('createAt', 'desc'));

            const unsubscribe = onSnapshot(Q, (snapshot) => {
                const bookmark = snapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as BookmarkPostData[]

                setBookmarkedPosts(bookmark)
            });
            return () => unsubscribe();
        }
    }, [bookmark])

    return (
        <>
            {bookmarkedPosts.length === 0 ?
                <p>북마크가 존재하지 않습니다.</p>
                :
                bookmarkedPosts.map((post) => (
                    <PostListStyle key={post.id}>
                        <div className="bookmark_title_wrap">
                            <input type="checkbox" className="bookmark_sel_btn" onChange={() => handleBookmarkSelect(post.id)} checked={selectBookmark.includes(post.id)} />
                            <p className="post_tag">{`[${post.tag}]`}</p>
                            <p className="post_title" onClick={() => clickBookmark(post.id)}>{post.title}</p>
                            {post.comment > 0 &&
                                <span className="post_comment">[{post.comment}]</span>
                            }
                        </div>
                        <p className="post_user">{post.userId === ADMIN && '관리자'}</p>
                        <p className="post_date">{formatDate(post.createAt)}</p>
                        <button className="bookmark_delete_btn" onClick={() => deleteBookmark(post.id)}></button>
                    </PostListStyle>
                ))
            }
            <div css={BottomBtnWrap} className="bottom_btn_wrap">
                <button css={BookmarkAllBtn} className="bookmark_all_btn" onClick={handleSelectAll}>
                    {selectAll ? '전체 해제' : '전체 선택'}
                </button>
                <button className="bookmark_select_delete_btn" onClick={() => deleteBookmark(selectBookmark)}>북마크 해제</button>
            </div>
        </>
    )
}