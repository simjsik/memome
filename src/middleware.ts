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

    if (pathname.startsWith('/home/') && !token) {
        const url = req.nextUrl.clone(); url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/login') && token) {
        const url = req.nextUrl.clone(); url.pathname = '/home/main';
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
        'sha256-SV0+KQmEG9z2c5j3KKzXQC79TiPEwbHoVgiEFzg4TC0=' \
        'sha256-GwHZT535b07mYnmBNai2AVuOqmgTTF1A4EqzeDlIyl0=' \
        'sha256-hviaKDxYhtiZD+bQBHVEytAzlGZ4afiWmKzkG+0beN8=' \
        'sha256-n8J8gRN8i9TcT9YXl0FTO+YR7t53ht5jak0CbXJTtOY=' \
        'sha256-uLchvEWMsEECU4bwHeXW2/TBPhNjz/BqwQXBXLLyJgw=' \
        'sha256-r1CdFo7qy8R40kOUsNAhoIyEbU5gIdZbw5B60zgKiak=' \
        'sha256-DyVZHcot51Ajnsrfgau05r7xTa5GaCieNj194kF3/PE=' \
        'sha256-bp8SOW+F6MqzXwRg+CjGqYSgZKePbEeXR9mWihyB9N0=' \
        'sha256-SNRa2TqSDe3fmC1ildCQj1WZ4x8adCorrsUJ1dwrGPI=' \
        'sha256-UTLKZ4iRwN16EQocQADl6Ws/1PxhdgCCEil0vLljYmU=' \
        'sha256-593I+EI41jKSKxw/7hnykemymPxZ5go3kfDHBjfFn8A=' \
        'sha256-1Ihl8eQwu8XzAXfzImS/6qLbkYfTFXXE62HiL1jpLyM=' \
        'sha256-WTT7K4PAjxDm98edS4Mtb0pwRUiXI8//npjqrEBMvtE=' \
        'sha256-eJEj6aOYfYL+t1D1ThpAfot5SzgDetcJcWiyhk9Ikmo=' \
        'sha256-bmVaDd4fC79JlyB48k8g4JDXTD8t/4cohFuwyLLEF+0=' \
        'sha256-xKYz+/bLakVJNJ1alE+0WIjRVW0EJ6L4eAtcY43c1Y0=' \
        'sha256-wNF1V44AqF1k3WMNIaWkov8OMn20BTp+HXnXR3Ua6EA=' \
        'sha256-Uty3T4c4/BqEceaLZ3jPjnMWOYL77fC7uoxcozHcHwc=' \
        'sha256-3+dWT0sIYL87Y5I3BGGc4jqkPMgKwr5ugWuRR6DmsRw=' \
        'sha256-CTBEltPiu0jfHQmYu//c4+DSVrYgNkp5GmP3aOZ6Pao=' \
        'sha256-YwFUevXIaGs9EjWoyvACGeg4PKKkwEaHsBJjuScOmoA=' \
        'sha256-gvm8L69KfKy5TvWFQ7qsrP2Ln6400aZsYRQr9+Uay70=' \
        'sha256-P6ZQ62WiSvM/QUJETej2hqmhb/SpjIZXIrS9Hc4KZfY=' \
        'sha256-gad3ObyaTNqvkOCH40a3soMCCSjsH1gKTCm1mlb/rIU=' \
        'sha256-/qQ9+ZeZnK7lEVLaN6aA0lUH5kHcLmBo4CRY1uEiYJk=' \
        'sha256-Haw3D/j2PnXYWMjW/tZyf79V4YKmUkjDyfO8HRirfF8=' \
        'sha256-2lEyL4Fi4Tf0yiBdFPGdbGnrD4EHTSWbODUqsnLt1rw=' \
        'sha256-mlvKTh4cY0NtScXMXssQZx1uhMGsU+Njhc6T2pydrsc=' \
        'sha256-sx4JfhEoQ5Fo7gxkE1gOYSq2CyhlSc08QUReDJODysI=' \
        'sha256-vq8yuYEzk/UEKx9ljiX6S26DsM13TOltuT5XHKUx13E=' \
        'sha256-iCAiL17AJ2UHMXEKFfT4Zpt26VlTU0/uorVMjLn/890=' \
        'sha256-jwWvjTqUcwRivhPpzxSmQviBbVVAcxiqDybwA1DeLwg=' \
        'sha256-EZPzprA/HrmKtEbD+m6ZBGfpZbBDUwGAJh40N1DipZQ=' \
        'sha256-zBbmyZbc/pcETv15w4K5wdeKFoPmeL5InSPiW2gBkpg=' \
        'sha256-RdqrNHJ3uaiBgj3+SjpgYxDbM9LFhbGqsqVzq/Q4YNk=' \
        'sha256-Hc7Ttvc5W+kkM5cbk2UD0X8Dmcr2d58Lt8kvodMF+FM=' \
        'sha256-J+jUkfHNIX8UJL6WN7levMV/71YVOFI8M4fd8verXaA=' \
        'sha256-NM1NLf1ygWBaA07i3BTNxvZ888oTNxKi/OUUatvAan8=' \
        'sha256-fpijDju8HYQBrdWC7Pu6S/zpaV7YAr3rMVkTslL3/sQ=' \
        'sha256-1N91OtSg1n8z1mMgXyvIqcrRtbWQuAbepsUMOflw8a4=' \
        'sha256-zPMiGFtI85WZqiJuWwviL/MK3eVTN23acRBpnMvwzss=' \
        'sha256-GyCrQBo6s1GN3c57RCo+3zNw4SN/Ah5Jdci3DmrDHAc=' \
        'sha256-VzArkaHqscWn+i33QxTwWaZNiN8BOFalaWZ/WO0k8cY=' \
        'sha256-36Oj1w9Bg4evALbyxa+4DpFUoEMqMSL7a2IQyWJniLI=' \
        'sha256-quX/9Fvq1GtrUByr7RTGLtSkN745gS6pw8V+td6GmaQ=' \
        'sha256-fuvOyr+5ReVROhbwl5YKEu8cykKFkYzBApSneJD9es4=' \
        'sha256-UeUI9OOPflq8RGmnhZE+L7IYhw5hK6XRMWFItQzpxNA=' \
        'sha256-ZKFgAuqnJZHkR3z/VuyVaLcwjjuw5InUxuRG+Jt3Fnk=' \
        'sha256-m3XdyqnoOtq/Ab2hIL87dbkkh+QxN4c6JSvMUYznIy0=' \
        'sha256-Wfz0thE/IrR3/Jygu9VXO1dcAt8HLdVFtF5alYM4wQE=' \
        'sha256-MCdQMVP3PRWuR0RP0SE7f2sPNHoHrTHaqRoCnWEULjU=' \
        'sha256-gYIFq4BNIhJgWvJZopH/IEqmdHrmAFDiyeoI07ClSRg=' \
        'sha256-i85DZxxh5WXQV7zXDze16A4nwsvgshEVEGK71ytGLLg=' \
        'sha256-qJtchQe6jYOmp61rywmuNiP04OLXhvqo5txpPVW4Y3o=' \
        'sha256-6m2/18O8XSI0OLaj54U5axZU5zScBicUK6wA9X9p//I=' \
        'sha256-Rd7FIUlQzi/avT19VP1pnhjSiNP4ns9+ltRqELyzTWw=' \
        'sha256-ncQuBgTBbCJe5SI1KtOv1JRZnwn867RDs8GD1tKyVHI=' \
        'sha256-HxMJT8X4mciyeE2oDvO08C4Uaz0W6txUAoMRae6cQfU=' \
        'sha256-SPo+sbojE11tTqLtg0KTGKDcEGa6j4AjUTA316gnSmA=' \
        'sha256-8FwacSQUj/uGBplEs3IY0gsYauL21hsiHMzIvS0FXDE=' \
        'sha256-i1EfB2+xYUUG32uDRMNI/DN/F9YIrGWOYdHENz9GKME=' \
        'sha256-pxBXuHetGtR+LLcZp/WQn/VdlMPd5J3wt/GK/QIMeTQ=' \
        'sha256-LnKs1keCqxctv78a9FO7W61BCqpiiqpg2vyBGsOCMcI=' \
        'sha256-yZHoMYHCTL4UbTCYI1O6T5p9JLgVM1ZYBzlEpDYz0DM=' \
        ;`
    );

    return res;
}

export const config = {
    matcher: ['/:path*']
};