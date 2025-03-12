import PostMenu from './PostMenu'

export const dynamic = "force-static"; // 정적 렌더링 설정

export const metadata = {
    title: "MEMOME :: 메모",
    description: "최근 있었던 일을 메모해보세요.",
};

export default function Post() {
    return (
        <PostMenu />
    )
}