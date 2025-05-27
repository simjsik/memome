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
const nonce = generateNonce();

// 1) 인증·리다이렉트 로직 (기존 코드)
export async function middleware(req: NextRequest) {
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

    const requestHeaders = new Headers(req.headers);

    requestHeaders.set('x-csp-nonce', nonce); // 요청헤더 
    const res = NextResponse.next({
        request: { headers: requestHeaders },       // 수정된 요청 헤더 사용
    });

    // 추가 보안 헤더도 응답에 설정
    res.headers.set('x-csp-nonce', nonce);
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.headers.set(
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
        'sha256-fq7Md9B0amksVBTk/2TaltdrTVq2JN7fvIk0tt80qzU=' \
        'sha256-xYFSKvPMCj0Vk3NmF1uDgVUQmi3L4JsVHJrhB8S4tbw=' \
        'sha256-Ttt/bmFw+dmA+g2PkUEuxsBL6M02Q+HF61TAeiNsjro=' \
        'sha256-MizmzrYbxcCxJr0W1K/Z14Iec3la7xLE9Fb2lkR0KQA=' \
        'sha256-LnYONn2bqVTW1q+4xTrr6sjwVsmtd1c/XXHj4aRH75g=' \
        'sha256-WUi579HKIKWgE3g04VCrUrRDOP/5kufIDR1BOzX+QXI=' \
        'sha256-ImRE02ZFFz/0nRW8Gh9wk8S1OfP1/3yM9f7tWf49uYQ=' \
        ;`
    );

    return res;
}

export const config = {
    matcher: ['/:path*']
};