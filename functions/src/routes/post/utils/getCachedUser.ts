import { adminDb } from "../../../DB/firebaseAdminConfig";

const userCache = new Map<string, { displayName: string; photoURL: string }>();

type Profile = { displayName: string; photoURL: string }

const defaultUser = {
    displayName: 'Unknown User',
    photoURL: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
};

/**
 * @param {userId<string>} userId
 * @return {user<string[]>}
 */
export async function getCachedUserInfo(userId: string) {
    if (userCache.has(userId)) {
        // 이미 한 번 읽은 값이 있으면 바로 리턴
        return userCache.get(userId)!;
    }

    // 캐시에 없으면 Firestore에서 조회
    let userRef = adminDb.doc(`users/${userId}`);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
        userRef = adminDb.doc(`guests/${userId}`);
        userDoc = await userRef.get();
    }

    const userData = userDoc.data() || defaultUser;

    const user = {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
    };

    // 캐시에 저장
    userCache.set(userId, { ...user });
    return user;
}


/**
 * @param {userId<string[]>} userId
 * @return {result<string, Profile>} result
 */
export async function getCachedUserBatch(userId: string[]) {
    const unique = Array.from(new Set(userId)).filter(Boolean);

    const result = new Map<string, Profile>();
    const needFetch: string[] = [];

    for (const id of unique) {
        const hit = userCache.get(id);

        if (hit) {
            result.set(id, { displayName: hit.displayName, photoURL: hit.photoURL });
        } else {
            needFetch.push(id);
        }
    }

    if (needFetch.length === 0) return result;


    // 캐시에 없으면 Firestore에서 조회
    const userRef = needFetch.map((id) => adminDb.doc(`users/${id}`));
    const userSnaps = await adminDb.getAll(...userRef);

    const unknownUser: string[] = [];

    userSnaps.forEach((snap, i) => {
        const id = needFetch[i];
        if (snap.exists) {
            const userData = snap.data() as Partial<Profile>;

            const profile = {
                displayName: userData.displayName ?? defaultUser.displayName,
                photoURL: userData.photoURL ?? defaultUser.photoURL,
            };

            result.set(id, profile);
            userCache.set(id, { ...profile });
        } else {
            unknownUser.push(id);
        }
    });

    // 없던 유저는 게스트에서.
    if (unknownUser.length > 0) {
        const guestRef = unknownUser.map((id) => adminDb.doc(`guests/${id}`));
        const guestSnaps = await adminDb.getAll(...guestRef);
        guestSnaps.forEach((snap, i) => {
            const id = unknownUser[i];

            if (snap.exists) {
                const guestData = snap.data() as Partial<Profile>;

                const profile = {
                    displayName: guestData.displayName ?? defaultUser.displayName,
                    photoURL: guestData.photoURL ?? defaultUser.photoURL,
                };

                result.set(id, profile);
                userCache.set(id, { ...profile });
            } else {
                result.set(id, defaultUser);
                userCache.set(id, { ...defaultUser });
            }
        });
    }

    // 캐시에 저장
    return result;
}
