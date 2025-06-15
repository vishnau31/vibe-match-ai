import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ This works with App Router
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const sessionId = (await params).id;

    const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: true },
    });

    if (!session) {
        return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
        exists: true,
        messages: session.messages,
    });
}
