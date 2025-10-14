import { PostData } from "./postType";

/**
 * @param {postDoc<PostData>} postDoc
 * @return {userId<string[]>}
 */
export function extractUniqueUserIds(
    postDoc: FirebaseFirestore.QueryDocumentSnapshot<PostData>[]
): string[] {
    const userId = Array.from(new Set(postDoc.map((d) => d.data().userId)));

    return userId;
}

/**
 * @param {postDoc<PostData>} posts
 * @return {userId<string[]>}
 */
export function extractUniqueUserIdsFromPosts(posts: PostData[]): string[] {
    return Array.from(
        new Set(posts.map((p) => p.userId).filter((v): v is string => typeof v === 'string' && v.length > 0))
    );
}
