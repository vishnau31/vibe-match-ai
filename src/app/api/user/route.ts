import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { name } = await req.json();

    if (!name) {
        return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
        where: { name },
    });

    if (existingUser) {
        return NextResponse.json({ id: existingUser.id, name: existingUser.name });
    }

    const newUser = await prisma.user.create({
        data: { name },
    });

    return NextResponse.json({ id: newUser.id, name: newUser.name });
}
