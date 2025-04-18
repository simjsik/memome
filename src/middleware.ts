import { NextRequest, NextResponse } from "next/server";

function generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    // Uint8Array를 문자열로 변환
    let str = '';
    for (let i = 0; i < array.length; i++) {
        str += String.fromCharCode(array[i]);
    }
    // base64 인코딩
    return btoa(str);
}

// 미들웨어 함수 정의
export async function middleware(req: NextRequest) {
    const requestHeaders = new Headers(req.headers);
    const pathname = req.nextUrl.pathname;
    const authToken = req.cookies.get('authToken');

    const nonce = generateNonce();

    requestHeaders.set('x-csp-nonce', nonce); // 요청헤더 
    const response = NextResponse.next({
        request: { headers: requestHeaders },       // 수정된 요청 헤더 사용
    });

    response.headers.set('x-csp-nonce', nonce); // 응답헤더에도 난수값 추가

    response.headers.set(
        'Content-Security-Policy',
        `style-src 'self' 'nonce-${nonce}' 'unsafe-hashes' \
        'sha256-otva1f6wkDzV9WurEmTw97pTGspFB6xN+csaPY1e4zI=' \
        'sha256-57GCXobV9ZrfnnzAWcz//WfzeGNfevTKdsoxtI25AZQ=' \
        'sha256-eXQbyB8YxZkWD5epgriI5Aoh333fjv618WjVSFU6Fbg=' \
        'sha256-/njX6B78PGTBraXQ6mH1bYCXVi3WJKlCGN17JPEK4Q8=' \
        'sha256-eNIPPaOamV/ib5wgfSPY7JyaVMnJjKTIIGo9yu04dns=' \
        'sha256-uynp81lkWe3ENuo5JQDvzP2HBVZtV7rDFse1S5KMKYU=' \
        'sha256-Z48SLN7BDrnlrkV3Ayto4e9RdtFuhJriqid0a0SU1gQ=' \
        'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' \
        'sha256-N6tSydZ64AHCaOWfwKbUhxXx2fRFDxHOaL3e3CO7GPI=' \
        ;`
    );

    // 현재 요청 경로가 /login 인지 확인
    if (pathname === '/login') {
        // HTTP Only 쿠키 authToken을 확인
        if ((authToken && authToken.value !== '')) {
            // authToken이 있다면 /home/main으로 리다이렉트
            const url = req.nextUrl.clone();
            url.pathname = '/home/main';
            return NextResponse.redirect(url);
        }
    }

    if (pathname.startsWith('/home/')) {
        if (!authToken || authToken.value === "") {
            // authToken이 없다면 /login으로 리다이렉트
            const url = req.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: ['/login/:path*', '/home/:path*']
};