import { NextRequest, NextResponse } from "next/server";

import { VerifySession } from "@/lib/keystone-server";

export async function GET(request: NextRequest) {
    const sessionId = request.headers.get("Authorization")?.split(" ")[1];
    console.log(sessionId);
    const verifiedSession = await VerifySession({ sessionId: sessionId!, appSecret: process.env.APP_SECRET!, appId: process.env.NEXT_PUBLIC_KEYSTONE_APPID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL! });
    return NextResponse.json(verifiedSession);
}
