import { NextRequest, NextResponse } from "next/server";
import { deleteSession, getSession } from "../redisClient";

export async function POST(req: NextRequest) {
    try {
        const { uid } = await req.json();
        const user = await getSession(uid);

        return NextResponse.json({
            message: "login successful",
            user
        });
    } catch (error) {
        const { uid } = await req.json();
        deleteSession(uid);
        if (error) {
            return NextResponse.json({ message: "게스트 세션 정보가 만료되었거나 유효하지 않습니다. : " + error }, { status: 403 });
        }
        return NextResponse.json({ message: "게스트 세션 정보가 만료되었거나 유효하지 않습니다." }, { status: 403 });
    }
}
