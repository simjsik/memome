import { atom } from "recoil"

export interface PostData {
    tag: string;
    title: string;
    id: string;
    userId: string;
    content: string;
    images?: string[];
    createAt: any;
    commentCount: number,
    notice: boolean,
}

export interface Comment {
    id: string
    replyId: string;
    user: string;
    commentText: string;
    createAt: any;
    localTimestamp: any;
    replies: Comment[];
    parentId: string | null;
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

export interface BookmarkPostData {
    tag: string;
    id: string;
    title: string;
    userId: string;
    comment: number;
    createAt: any;
}

export const ADMIN_ID = atom<string>({
    key: 'ADMIN_USER_ID',
    default: '8KGNsQPu22Mod8QrXh6On0A8R5E2'
})

export const PostingState = atom<string>({
    key: 'PostingState',
    default: ''
})

export const PostState = atom<PostData[]>({
    key: 'PostState',
    default: []
})

export const DidYouLogin = atom<boolean>({
    key: 'DidYouLogin',
    default: false
})

export const userState = atom<string | null>({
    key: 'userState',
    default: null
})

export const loginToggleState = atom<boolean>({
    key: 'loginToggleState',
    default: false
})

export const postStyleState = atom<boolean>({
    key: 'postStyleState',
    default: true,
})

export const storageLoadState = atom<boolean>({
    key: 'storageLoadState',
    default: false,
})

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
        ], user: ''
    },
})

export const memoCommentState = atom<Comment[]>({
    key: 'memoCommentState',
    default: [],
})

export const newNoticeState = atom<boolean>({
    key: 'newNoticeState',
    default: false,
})
