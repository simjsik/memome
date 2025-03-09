import MainHome from "./MainClient";

export const metadata = {
    title: "메모 목록",
    description: "최근 공유된 메모를 확인해보세요.",
};

// 서버 컴포넌트
export default async function MemoPage() {
    return (
        <>
            <MainHome />
        </>
    )
}