import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const sessions = await prisma.chatSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
    });

    return NextResponse.json({ sessions });
}
