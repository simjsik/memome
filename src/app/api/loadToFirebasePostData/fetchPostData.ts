import { Timestamp } from "firebase/firestore";

// 포스트의 댓글
export const fetchComments = async (userId: string, postId: string) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const PostResponse = await fetch('http://localhost:3000/api/loadToFirebasePostData/fetchComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId }),
        })
        if (!PostResponse.ok) {
            const errorDetails = await PostResponse.json();
            throw new Error(`댓글 요청 실패: ${errorDetails.message}`);
        }

        const commentData = await PostResponse.json()
        const commentCount = commentData.commentCounts
        const comments = commentData.comments

        return { commentCounts: commentCount, comments: comments };
    } catch (error: any) {
        console.error('Error in fetchPosts:', error.message);
        throw error;
    }
};

// 포스트 페이지 입장 시 '작성자'의 모든 글
export const fetchPostList = async (
    userId: string,
    pageParam: [boolean, Timestamp] | [boolean, null] | null = null,
    pageSize: number = 4, // 무한 스크롤 시 가져올 데이터 수.
) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const PostResponse = await fetch('http://localhost:3000/api/loadToFirebasePostData/fetchPostList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, pageParam, pageSize }),
        })
        if (!PostResponse.ok) {
            const errorDetails = await PostResponse.json();
            throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
        }

        const postData = await PostResponse.json()
        const postWithComment = postData.data
        const nextPage = postData.nextPage


        return {
            data: postWithComment,
            nextPage: nextPage
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    };
};

// 이미지 포스트 무한 스크롤 로직
export const fetchPostsWithImages = async (
    userId: string,
    pageParam: [boolean, Timestamp] | [boolean, null] | null = null,
    pageSize: number = 6, // 무한 스크롤 시 가져올 데이터 수
) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const PostResponse = await fetch('http://localhost:3000/api/loadToFirebasePostData/fetchPostsWithImages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, pageParam, pageSize }),
        })
        if (!PostResponse.ok) {
            const errorDetails = await PostResponse.json();
            throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
        }

        const postData = await PostResponse.json()
        const postWithImage = postData.imageData
        const nextPage = postData.nextPage

        return {
            imageData: postWithImage,
            nextPage: nextPage
        };
    } catch (error: any) {
        console.error('Error in fetchPostsWithImages:', error.message);
        return error;
    }
};

// 일반 포스트 무한 스크롤 로직
export const fetchPosts = async (
    userId: string | null = null,
    pageParam: [boolean, Timestamp] | null = null,
    pageSize: number = 4, // 무한 스크롤 시 가져올 데이터 수.
) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const PostResponse = await fetch('http://localhost:3000/api/loadToFirebasePostData/fetchPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({ userId, pageParam, pageSize }),
        })

        if (!PostResponse.ok) {
            const errorDetails = await PostResponse.json();
            throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
        }

        const postData = await PostResponse.json()
        const postWithComment = postData.data
        const nextPage = postData.nextPage

        return {
            data: postWithComment,
            nextPage: nextPage
        };
    } catch (error: any) {
        console.error('Error in fetchPosts:', error.message);
        throw error;
    }
};

// 공지사항 포스트 무한 스크롤 로직
export const fetchNoticePosts = async (
    userId: string | null = null,
    pageParam: [boolean, Timestamp] | [boolean, null],
    pageSize: number = 4, // 무한 스크롤 시 가져올 데이터 수.
) => {
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const PostResponse = await fetch('http://localhost:3000/api/loadToFirebasePostData/fetchNoticePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, pageParam, pageSize }),
        })
        if (!PostResponse.ok) {
            const errorDetails = await PostResponse.json();
            throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
        }

        const postData = await PostResponse.json()
        const postWithComment = postData.data
        const nextPage = postData.nextPage
        // console.log(postWithComment, 'postWithComment', nextPage, 'nextPage', '받은 데이터')

        return {
            data: postWithComment,
            nextPage: nextPage
        };
    } catch (error: any) {
        console.error('Error in fetchPosts:', error.message);
        throw error;
    }
};



// 북마크 무한 스크롤 로직
export const fetchBookmarks = async (
    userId: string,
    bookmarkIds: string[], // currentBookmark 배열
    startIdx: number, // 시작 인덱스
    pageSize: number = 4 // 페이지당 데이터 수
) => {
    if (bookmarkIds.length <= 0) return;
    try {
        const LimitResponse = await fetch('http://localhost:3000/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            }
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }

        const BookmarkResponse = await fetch('http://localhost:3000/api/loadToFirebasePostData/fetchBookmarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId || '',
            },
            body: JSON.stringify({ bookmarkIds, startIdx, pageSize }),
        });
        if (!BookmarkResponse.ok) {
            const errorDetails = await BookmarkResponse.json();
            throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
        }

        const bookmarkData = await BookmarkResponse.json()

        const validPosts = bookmarkData.validPosts
        const nextIndex = bookmarkData.nextIndex

        return { data: validPosts, nextIndexData: nextIndex };
    } catch (error: any) {
        console.error('Error in fetchPosts:', error.message);
        throw error;
    }
};