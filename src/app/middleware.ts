import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const hasGuest = req.cookies.get("hasGuest")?.value;

    // 게스트 상태일 경우 제한 처리
    if (hasGuest === "true") {
        const url = req.nextUrl.clone();
        url.pathname = "/error/guest-restriction";
        return NextResponse.redirect(url); // 제한 페이지로 리디렉션
    }

    return NextResponse.next(); // 계속 진행
}

export const config = {
    matcher: ["/api/:path*"], // 특정 API 경로에만 미들웨어 적용
};
