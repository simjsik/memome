import { doc, getDoc } from "firebase/firestore";
import UserClient from "./userClient";
import { db } from "@/app/DB/firebaseConfig";
import { userData } from "@/app/state/PostState";
import './userStyle.css'
import { fetchPostList, fetchPosts, fetchPostsWithImages } from "@/app/api/loadToFirebasePostData/fetchPostData";
interface UserPageProps {
    params: {
        userId: string;
    };
}
export default async function UserHome({ params }: UserPageProps) {
    const { userId } = params;

    const userProfile = doc(db, 'users', userId);
    const userSnap = await getDoc(userProfile);
    let userData = null;
    if (userSnap.exists()) {
        const snapData = userSnap.data();

        userData = {
            ...snapData,
            uid: userId,
            name: snapData.displayName,
            photo: snapData.photoURL,
        } as userData
    }

    const { nextPage: initialNextPage } = await fetchPosts(userId, null, 4);
    const { nextPage: initialImageNextPage } = await fetchPostsWithImages(userId, null, 4);

    return (
        <>
            <div className="user_wrap">
                <div className="user_profile_wrap">
                    <div className="user_photo_wrap">
                        <div className="user_photo" style={{ backgroundImage: `url(${userData?.photo})` }}></div>
                    </div>
                    <div className="user_name_wrap">
                        <p className="user_name">
                            {userData?.name}
                        </p>
                        <span className="user_uid">@{userData?.uid.slice(0, 8)}...</span>
                    </div>
                </div>
                {userData && <UserClient user={userData} post={[]} initialNextPage={initialNextPage} imagePost={[]} initialImageNextPage={initialImageNextPage} />}
            </div>
        </>
    )
}