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


export const postConverter: FirebaseFirestore.FirestoreDataConverter<fromPostData> = {
    toFirestore: (p) => p,
    fromFirestore: (snap) => snap.data() as fromPostData,
};
