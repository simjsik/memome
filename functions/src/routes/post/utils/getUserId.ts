import { PostData } from "../mainPost";

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
