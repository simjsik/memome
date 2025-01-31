import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const hasGuest = req.cookies.get("hasGuest")?.value;

    console.log(hasGuest, '미들웨어 쿠키 확인1')

    if (hasGuest === undefined) {
        // 쿠키가 없으면 로그인 페이지로 리디렉션
        console.error('게스트 유저 상태 확인 불가')
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    // 게스트 상태일 경우 제한 처리
    if (hasGuest === 'true') {
        console.error('게스트 유저 확인')
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next(); // 계속 진행
}

export const config = { // 특정 API 경로에만 미들웨어 적용
    matcher: ["/api/loadToFirebasePostData/:path*"],
};
