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
    const response = NextResponse.next();
    const pathname = req.nextUrl.pathname;

    // 현재 요청 경로가 /login 인지 확인
    if (pathname === '/login') {
        // HTTP Only 쿠키 authToken을 확인
        const authToken = req.cookies.get('authToken');
        if (authToken) {
            // authToken이 있다면 /home/main으로 리다이렉트
            const url = req.nextUrl.clone();
            url.pathname = '/home/main';
            return NextResponse.redirect(url);
        }
    }

    if (pathname.startsWith('/home/') || pathname === '/login') {
        const nonce = generateNonce();

        // 전체 페이지에 적용할 B 기능
        response.headers.set(
            'Content-Security-Policy',
            `style-src 'self' 'nonce-${nonce}' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';`
        );

        response.headers.set('x-csp-nonce', nonce);
        // 예를 들어 다른 쿠키나 헤더도 설정 가능
    }
    return response;
}

// 이 미들웨어는 /login 경로에만 적용됩니다.
export const config = {
    matcher: ['/:path*']
};