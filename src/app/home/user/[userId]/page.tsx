import UserClient from "./userClient";
import { userData } from "@/app/state/PostState";
import './userStyle.css'
import { Metadata } from "next";
import { adminDb } from "@/app/DB/firebaseAdminConfig";

interface UserPageProps {
    params: {
        userId: string;
    };
}

// 동적 메타데이터 설정
export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
    const { userId } = params;

    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        return { title: "페이지를 찾을 수 없음" };
    }

    const userData = userSnap.data();

    return {
        title: `MEMOME :: ${userData?.displayName}(@${userId.slice(0, 8)}...)`,
        description: userId.slice(0, 8) + "...",
        openGraph: {
            title: userData?.displayName,
            description: userId.slice(0, 8) + "...",
            type: "article",
            images: [{ url: userData?.photoURL || "/default.jpg" }]
        }
    };
}


export default async function UserHome({ params }: UserPageProps) {
    const { userId } = params;

    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    let userData = null;

    if (userSnap.exists) {
        const snapData = userSnap.data();

        userData = {
            ...snapData,
            uid: userId,
            name: snapData?.displayName,
            photo: snapData?.photoURL,
        } as userData
    }

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
                {userData && <UserClient user={userData} />}
            </div>
        </>
    )
}