import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vibeToStructuredPlan } from "@/lib/ai/vibeMapper";
import { smartRecommendWithLLM } from "@/lib/ai/recommend";

export type ChatAttributes = Record<string, string | number | string[]>;

export interface ChatMessage {
    sender: string;
    text: string;
}

interface Recommendation {
    [key: string]: string | number | string[];
}

export async function POST(req: NextRequest) {
    const { sessionId, userMessage, userId } = await req.json();

    let session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: true },
    });

    if (!session) {
        session = await prisma.chatSession.create({
            data: {
                id: sessionId,
                userId,
                attributes: {} as ChatAttributes,
                messages: {
                    create: [{ sender: "user", text: userMessage }],
                },
            },
            include: { messages: true },
        });
    } else {
        await prisma.message.create({
            data: {
                sessionId,
                sender: "user",
                text: userMessage,
            },
        });
    }

    const userMessages = session.messages
        .filter((m: ChatMessage) => m.sender === "user")
        .map((m: ChatMessage) => m.text)
        .concat(userMessage);

    let stage: "followup" | "recommend" = "followup";
    let reply = "";
    let recommendations: Recommendation[] = [];
    let justification = "";

    const { attributes, followups } = await vibeToStructuredPlan(
        userMessage,
        (session.attributes || {}) as ChatAttributes
    );

    const updatedAttrs: ChatAttributes = {
        ...(session.attributes as ChatAttributes || {}),
        ...attributes
    };

    await prisma.chatSession.update({
        where: { id: sessionId },
        data: { attributes: updatedAttrs },
    });

    if (followups?.length > 0 && userMessages.length < 4) {
        reply = followups[0];
        stage = "followup";
    } else {
        stage = "recommend";
        const result = await smartRecommendWithLLM(updatedAttrs);
        recommendations = result.recommendations;
        justification = result.justification;

        reply = justification;

        await prisma.message.create({
            data: {
                sessionId,
                sender: "agent",
                text:
                    "Here are your top picks in JSON format:\n```json\n" +
                    JSON.stringify(recommendations.slice(0, 5), null, 2) +
                    "\n```",
            },
        });
    }

    await prisma.message.create({
        data: {
            sessionId,
            sender: "agent",
            text: reply,
        },
    });

    return NextResponse.json({
        sessionId,
        reply,
        stage,
        attributes: updatedAttrs,
        recommendations,
        justification,
    });
}
