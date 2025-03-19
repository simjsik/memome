import ClientNotice from "./NoticeClient";

export const metadata = {
    title: "MEMOME :: 공지사항",
    description: "최신 공지사항 메모를 확인하세요.",
};

// 서버 컴포넌트
export default async function MemoPage() {
    return (
        <>
            <ClientNotice />
        </>
    )
}