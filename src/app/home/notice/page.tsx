import ClientNotice from "./NoticeClient";
export const dynamic = "force-static"; // 정적 렌더링 설정
// 서버 컴포넌트
export default async function MemoPage() {
    return (
        <>
            <ClientNotice />
        </>
    )
}