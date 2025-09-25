import { Timestamp } from "firebase/firestore";
import { atom, atomFamily } from "recoil"

export interface ImageUrls {
    key?: string;
    localSrc?: string;
}

export interface PostData {
    tag: string;
    title: string;
    id?: string;
    userId: string;
    content: string;
    thumbnail?: ImageUrls;
    images: boolean;
    createAt: Timestamp;
    commentCount: number,
    notice: boolean,
    displayName?: string,
    photoURL?: string,
    objectID?: string,
}

export interface ImagePostData {
    id: string;
    images?: string[] | false;
}

export interface unsavedPostData {
    tag: string;
    title: string;
    content: string;
    images?: ImageUrls[];
    date: Date;
}

export interface userData {
    name: string | null;
    email: string | null;
    photo: string;
    uid: string | null;
}

export interface Comment {
    id: string;
    replyId: string;
    uid: string;
    commentText: string;
    createAt: Timestamp;
    parentId: string | null;
    replyCount: number;
    displayName: string;
    photoURL: string | null;
}

export interface memoList {
    list:
    {
        tag: string,
        id: string,
        title: string,
        images: string[],
        createAt: Timestamp;
    }[],
    user: string
}

export interface noticeType {
    noticeId: string,
    noticeType: string,
    noticeText: string,
    noticeAt: Timestamp,
}

export interface BookmarkPage {
    data: PostData[];      // 각 페이지의 포스트 데이터 배열
    nextIndexData: number; // 다음 페이지 시작 인덱스
}

export interface BookmarkCache {
    pages: BookmarkPage[];
    pageParams: number[];
}

// 사용량 제한 알림
export const UsageLimitState = atom<boolean>({
    key: 'UsageLimit',
    default: false
})

// 사용량 제한 토글
export const UsageLimitToggle = atom<boolean>({
    key: 'UsageLimitToggle',
    default: false
})

export const PostTitleState = atom<string | null>({
    key: 'PostTitleState',
    default: null
})

export const PostContentState = atom<string | null>({
    key: 'PostContentState',
    default: null
})

export const PostTagState = atom<string>({
    key: 'PostTagState',
    default: '기타'
})

// 저장안된 포스트 작성 내용
export const ImageUrlsState = atom<ImageUrls[]>({
    key: 'ImageUrlsState',
    default: []
})

// 포스트 데이터
export const PostState = atom<PostData[]>({
    key: 'PostState',
    default: []
})

// 공지사항 데이터
export const noticeState = atom<PostData[]>({
    key: 'noticeState',
    default: []
})

// 북마크 데이터
export const bookMarkState = atom<string[] | null>({
    key: 'bookMarkState',
    default: null
})

// 북마크 페이지 데이터
export const userBookMarkState = atom<PostData[]>({
    key: 'userBookMarkState',
    default: []
})

export const DidYouLogin = atom<boolean>({
    key: 'DidYouLogin',
    default: false
})

export const hasGuestState = atom<boolean>({
    key: 'hasGuestState',
    default: false
})

// 알림 리스트
export const noticeList = atom<noticeType[]>({
    key: 'noticeList',
    default: [],
})

// 유저 ID
export const userState = atom<userData>({
    key: 'userState',
    default: {
        name: null,
        email: null,
        photo: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
        uid: null,
    },
})

export const adminState = atom<boolean>({
    key: 'adminState',
    default: false,
})

// 로그인 창 토글
export const loginToggleState = atom<boolean>({
    key: 'loginToggleState',
    default: false
})

// 포스트 보기 스타일 토글
export const postStyleState = atom<boolean>({
    key: 'postStyleState',
    default: true,
})

// 로컬 스토리지 내용 확인 없으면 false
export const storageLoadState = atom<boolean>({
    key: 'storageLoadState',
    default: false,
})

// 포스트 페이지 입장 시 상태 창에 현재 작성자의 모든 포스트 데이터
export const memoState = atom<memoList>({
    key: 'memoState',
    default: {
        list: [
            {
                tag: '',
                id: '',
                title: '',
                images: [],
                createAt: Timestamp.now(),
            }
        ],
        user: ''
    },
})

// 포스트 댓글 수
export const memoCommentCount = atom<number>({
    key: 'memoCommentCount',
    default: 0,
})

export const memoCommentState = atom<Comment[]>({
    key: 'memoCommentState',
    default: [],
})

export const repliesToggleState = atomFamily<boolean, string>({
    key: 'repliesToggleState',
    default: false,
})
// 새 공지사항 알림 토글
export const newNoticeState = atom<boolean>({
    key: 'newNoticeState',
    default: false,
})

// 검색 토글
export const searchState = atom<boolean>({
    key: 'searchState',
    default: false,
})

// 모달
export const modalState = atom<boolean>({
    key: 'modalState',
    default: false
})

// 회원가입 토글
export const signUpState = atom<boolean>({
    key: 'signUpState',
    default: false
})

export const loadingState = atom<boolean>({
    key: 'loadingState',
    default: true,
})

export const statusState = atom<boolean>({
    key: 'statusState',
    default: false
})

export const commentModalState = atom<boolean>({
    key: 'commentModalState',
    default: false
})

export const nonceState = atom<string>({
    key: 'nonceState',
    default: ''
})

export const autoLoginState = atom<boolean>({
    key: 'autoLoginState',
    default: false,
})

