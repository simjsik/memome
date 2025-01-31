import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const hasGuest = req.cookies.get("hasGuest")?.value;

    console.log(hasGuest, '미들웨어 쿠키 확인1')

    // ⛔ 게스트 유저인 경우 → API 요청 차단 (403 에러 반환)
    if (hasGuest === "true") {
        console.error("게스트 유저 API 요청 제한");
        return NextResponse.json({ message: "GUEST_ACCESS_DENIED" }, { status: 403 });
    }


    return NextResponse.next(); // 계속 진행
}

export const config = { // 특정 API 경로에만 미들웨어 적용
    matcher: ["/api/loadToFirebasePostData/:path*"],
};
