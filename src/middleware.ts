import { NextRequest, NextResponse } from "next/server";
import { chainMatch, isPageRequest, csp, strictDynamic } from '@next-safe/middleware';

// function generateNonce(): string {
//     const array = new Uint8Array(16);
//     crypto.getRandomValues(array);
//     // Uint8Array를 문자열로 변환
//     let str = '';
//     for (let i = 0; i < array.length; i++) {
//         str += String.fromCharCode(array[i]);
//     }
//     // base64 인코딩
//     return btoa(str);
// }

// // 미들웨어 함수 정의
// export async function middleware(req: NextRequest) {
//     const nonce = generateNonce();

//     const requestHeaders = new Headers(req.headers);
//     const response = NextResponse.next({
//         request: { headers: requestHeaders }, // 수정된 요청 헤더 사용
//     });
//     requestHeaders.set(
//         'Content-Security-Policy',
//         `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}' 'unsafe-hashes';`
//     );
//     requestHeaders.set('x-csp-nonce', nonce); // 요청헤더 

//     response.headers.set('X-Content-Type-Options', 'nosniff');
//     response.headers.set('X-Frame-Options', 'DENY');
//     response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

//     return response;
// }

// 1) 인증·리다이렉트 로직 (기존 코드)
function authRedirect(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('authToken')?.value;
    if (pathname === '/login' && token) {
        const url = req.nextUrl.clone(); url.pathname = '/home/main';
        return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/home/') && !token) {
        const url = req.nextUrl.clone(); url.pathname = '/login';
        return NextResponse.redirect(url);
    }
    return null;
}

// 2) CSP 자동화 미들웨어
const cspMiddleware = csp({
    directives: {
        "default-src": ["self"],
        "script-src": ["self"],
        "style-src": ["self"],
        "img-src": ["self", "data:"],
        "font-src": ["self", "data:"],
        "connect-src": ["self", "https:"]
    },
    reportOnly: false,       // 위반 리포트만 하고 싶다면 true
});

// 3) strict-dynamic 추가 (Optional)
//    nonce 기반 CSP에서 동적 스크립트 로딩을 안전하게 허용
const dynamicMiddleware = strictDynamic();

// 4) 최종 내보내기: 페이지 요청에만 적용
export default chainMatch(isPageRequest)(
    (req: NextRequest) => {
        const redirects = authRedirect(req);
        if (redirects) return redirects;
        return NextResponse.next();
    },
    cspMiddleware,
    dynamicMiddleware
);

export const config = {
    matcher: ['/login/:path*', '/home/:path*']
};