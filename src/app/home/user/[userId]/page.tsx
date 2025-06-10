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

    if (!userSnap.exists) {
        return {
            title: `MEMOME :: 유저를 찾을 수 없습니다.`,
            description: "...",
            openGraph: {
                title: `MEMOME :: 유저를 찾을 수 없습니다.`,
                description: "...",
                type: "article",
                url: `https://memome-delta.vercel.app/home/main`,
                images: [{ url: "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg" }]
            },
            twitter: {
                card: 'summary_large_image',
                title: `MEMOME :: 유저를 찾을 수 없습니다.`,
                description: "...",
                images: [{ url: "https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg" }]
            },
        };
    }

    const userData = userSnap.data();

    return {
        title: `MEMOME :: ${userData?.displayName}(@${userId.slice(0, 8)}...)`,
        description: userId.slice(0, 8) + "...",
        openGraph: {
            title: `MEMOME :: ${userData?.displayName}(@${userId.slice(0, 8)}...)`,
            description: userId.slice(0, 8) + "...",
            type: "article",
            url: `https://memome-delta.vercel.app/home/user/${params.userId}`,
            images: [{ url: userData?.photoURL || 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg' }]
        },
        twitter: {
            card: 'summary_large_image',
            title: `MEMOME :: ${userData?.displayName}(@${userId.slice(0, 8)}...)`,
            description: userId.slice(0, 8) + "...",
            images: [{ url: userData?.photoURL || 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg' }]
        },
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
                        <span className="user_uid">@{userData?.uid?.slice(0, 8)}...</span>
                    </div>
                </div>
                {userData && <UserClient user={userData} />}
            </div>
        </>
    )
}