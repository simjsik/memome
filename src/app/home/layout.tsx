/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect } from 'react';
import NavBar from '../components/NavBar';
import UsageLimit from '../components/UsageLimit';
import LoginBox from '../login/LoginBox';
import StatusBox from '../components/StatusBox';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { bookMarkState, hasGuestState, UsageLimitState, UsageLimitToggle, userData, userState } from '../state/PostState';
import { checkUsageLimit } from '../api/utils/checkUsageLimit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../DB/firebaseConfig';

type LayoutProps = {
    children: ReactNode;
};

function HomeContent({ children }: LayoutProps) {
    const currentUser = useRecoilValue<userData | null>(userState)
    const hasGuest = useRecoilValue(hasGuestState)
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)

    // 사용량 확인
    useEffect(() => {
        if (currentUser) {
            const checkLimit = async () => {
                try {
                    await checkUsageLimit(currentUser.uid);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        if (err.message.includes('사용량 제한')) {
                            setUsageLimit(true);
                        } else {
                            console.log('사용량을 불러오는 중 에러가 발생했습니다.');
                        }
                    }
                }
            }

            const loadBookmarks = async (uid: string) => {
                if (hasGuest) {
                    return setCurrentBookmark([]);
                }
                try {
                    const bookmarks = await getDoc(doc(db, `users/${uid}/bookmarks/bookmarkId`));
                    if (bookmarks.exists()) {
                        // 북마크 데이터가 있을 경우
                        const data = bookmarks.data() as { bookmarkId: string[] };
                        setCurrentBookmark(data.bookmarkId); // Recoil 상태 업데이트
                    }
                } catch (error) {
                    console.error("북마크 데이터를 가져오는 중 오류 발생:", error);
                    setCurrentBookmark([]);
                }
            }
            loadBookmarks(currentUser.uid);

            checkLimit();
        }
    }, [currentUser, hasGuest])

    useEffect(() => {
        if (usageLimit) {
            setLimitToggle(true);
        }
    }, [usageLimit])
    return (
        <>
            <LoginBox />
            <StatusBox></StatusBox>
            <UsageLimit />
            <NavBar></NavBar>
            {children}
        </>
    );
}


export default function HomeLayout({ children }: LayoutProps) {
    return (
        <HomeContent>
            {children}
        </HomeContent>
    );
}