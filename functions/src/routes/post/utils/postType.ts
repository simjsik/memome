import { Timestamp } from "firebase-admin/firestore";

export interface ImageUrls {
    key?: string;
    localSrc?: string;
}

export interface fromPostData {
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
    public: boolean,
    displayName?: string,
    photoURL?: string,
    objectID?: string,
}

export interface toPostData {
    tag: string;
    title: string;
    id?: string;
    userId: string;
    content: string;
    thumbnail?: ImageUrls;
    images: boolean;
    createAt: number;
    commentCount: number,
    notice: boolean,
    public: boolean,
    displayName?: string,
    photoURL?: string,
    objectID?: string,
}

export interface fromComment {
    id?: string;
    replyId: string;
    userId: string;
    commentText: string;
    createAt: Timestamp;
    parentId: string | null;
    replyCount?: number;
    displayName: string;
    photoURL: string | null;
    deleted?: boolean;
    deletedAt?: Timestamp;
    deletedBy?: string;
}

export interface toComment {
    id?: string;
    replyId: string;
    userId: string;
    commentText: string;
    createAt: number;
    parentId: string | null;
    replyCount?: number;
    displayName: string;
    photoURL: string | null;
    deleted?: boolean;
    deletedAt?: number;
    deletedBy?: string;
}

export const postConverter: FirebaseFirestore.FirestoreDataConverter<fromPostData> = {
    toFirestore: (p) => p,
    fromFirestore: (snap) => snap.data() as fromPostData,
};

export const commentConverter: FirebaseFirestore.FirestoreDataConverter<fromComment> = {
    toFirestore: (p) => p,
    fromFirestore: (snap) => snap.data() as fromComment,
};
