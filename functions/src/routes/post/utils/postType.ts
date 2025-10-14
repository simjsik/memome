import { Timestamp } from "firebase-admin/firestore";

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
    public: boolean,
    displayName?: string,
    photoURL?: string,
    objectID?: string,
}

export interface ImageUrls {
    key?: string;
    localSrc?: string;
}

export const postConverter: FirebaseFirestore.FirestoreDataConverter<PostData> = {
    toFirestore: (p) => p,
    fromFirestore: (snap) => snap.data() as PostData,
};
