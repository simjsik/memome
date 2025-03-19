import { Timestamp } from "firebase/firestore";
import { atom } from "recoil"

export interface PostData {
    tag: string;
    title: string;
    id: string;
    userId: string;
    content: string;
    images?: string[] | false;
    createAt: Timestamp;
    commentCount: number,
    notice: boolean,
    displayName: string,
    PhotoURL: string | null,
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
    images?: string[] | false;
    date: Date;
}

export interface userData {
    name: string | null;
    email: string | null;
    photo: string | null;
    uid: string;
}

export interface Comment {
    id: string
    replyId: string;
    user: string;
    commentText: string;
    createAt: Timestamp;
    replies: Comment[];
    parentId: string | null;
    displayName: string,
    PhotoURL: string | null,
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

// 관리자 아이디
export const ADMIN_ID = atom<string>({
    key: 'ADMIN_USER_ID',
    default: '8KGNsQPu22Mod8QrXh6On0A8R5E2'
})

// 저장안된 포스트 작성 내용
export const PostingState = atom<string>({
    key: 'PostingState',
    default: ''
})
export const PostTitleState = atom<string>({
    key: 'PostTitleState',
    default: ''
})
export const ImageUrlsState = atom<string[]>({
    key: 'ImageUrlsState',
    default: []
})
export const SelectTagState = atom<string>({
    key: 'SelectTagState',
    default: '기타'
})


// firebase에 저장된 포스트 데이터
export const PostState = atom<PostData[]>({
    key: 'PostState',
    default: []
})
// firebase에 저장된 공지사항 데이터
export const noticeState = atom<PostData[]>({
    key: 'noticeState',
    default: []
})

// firebase에 저장된 북마크 데이터
export const bookMarkState = atom<string[]>({
    key: 'bookMarkState',
    default: []
})

// 북마크 페이지 데이터
export const userBookMarkState = atom<PostData[]>({
    key: 'userBookMarkState',
    default: []
})

// 로그인 유무 확인
export const DidYouLogin = atom<boolean>({
    key: 'DidYouLogin',
    default: false
})

// 로그인 유무 확인
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
        photo: null,
        uid: '', // uid는 빈 문자열로 초기화
    },
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

// 포스트 댓글
export const memoCommentState = atom<Comment[]>({
    key: 'memoCommentState',
    default: [],
})

// 포스트 댓글 수
export const memoCommentCount = atom<number>({
    key: 'memoCommentCount',
    default: 0,
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
    key : 'loadingState',
    default : false
})