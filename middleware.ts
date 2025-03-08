import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
    const userToken = req.cookies.get('user_uid')?.value;

    if (!userToken || !secret) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const decoded = jwt.verify(userToken, secret) as JwtPayload & { uid: string };

    if (!decoded.uid) {
        return new NextResponse("Invalid token", { status: 403 });
    }

    const headers = new Headers(req.headers);
    headers.set('x-user-uid', decoded.uid);
    return NextResponse.next({ headers }); // 계속 진행
}

export const config = { // 특정 API 경로에만 미들웨어 적용
    matcher: ["/home/main/:path*", "/home/notice/:path*"],
};
