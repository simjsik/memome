import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../redisClient";

export async function POST(req: NextRequest) {
    try {
        const { uid } = await req.json();
        const user = await getSession(uid);

        return NextResponse.json({
            message: "login successful",
            user
        });
    } catch (error) {
    }
}
