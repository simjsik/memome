import { Timestamp } from "firebase/firestore";
import { atom } from "recoil"

export interface PostData {
    tag: string;
    title: string;
    id: string;
    userId: string;
    content: string;
    images?: string[] | false;
    createAt: any;
    commentCount: number,
    notice: boolean,
    displayName: string,
    PhotoURL: string | null,
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
    createAt: any;
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
        createAt: any,
    }[],
    user: string
}

export interface noticeType {
    noticeId: string,
    noticeType: string,
    noticeText: string,
    noticeAt: any,
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

// 포스트 업로드 시 입력한 내용
export const PostingState = atom<string>({
    key: 'PostingState',
    default: ''
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

// 알림 리스트
export const noticeList = atom<noticeType[]>({
    key: 'noticeList',
    default: [],
})

// 유저 ID
export const userState = atom<userData | null>({
    key: 'userState',
    default: null
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
                createAt: '',
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