import fs from "fs";
import path from "path";
import { openai } from "@/lib/openai";

const vibeExamples = fs.readFileSync(
    path.resolve("./src/data/vibe_to_attribute.txt"),
    "utf-8"
);

export async function vibeToStructuredPlan(
    vibeText: string,
    knownAttributes: Record<string, string | number | string[]> = {}
): Promise<{
    attributes: Record<string, string | number | string[]>;
    followups: string[];
}> {
    const prompt = `
        You are a fashion shopping assistant.

        A user described their vibe as:
        "${vibeText}"

        Here are attributes we've already gathered:
        ${JSON.stringify(knownAttributes, null, 2)}

        Here are examples of how vibes map to structured attributes:
        ${vibeExamples}

        Your task:
        1. Infer new structured fashion attributes from the vibe (e.g. fit, fabric, occasion, price_max, size).
        2. Generate up to 2 - 3 helpful follow-up questions to clarify missing aspects.
        3. Output ONLY valid JSON in this format (do not explain anything):

        {
            "attributes": {
                "fit": "relaxed",
                "fabric": ["cotton", "linen"]
            },
            "followups": [
                "Any price range I should stick to?",
                "Do you want sleeveless or short sleeves?"
            ]
        }
`;



    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
    });

    try {
        console.log(completion.choices[0].message.content);
        const raw = completion.choices[0].message.content || "";
        const clean = raw.replace(/```(?:json)?|```/g, "").trim();
        const parsed = JSON.parse(clean);
        return {
            attributes: { ...knownAttributes, ...(parsed.attributes || {}) },
            followups: parsed.followups || [],
        };
    } catch (err) {
        console.error("Failed to parse structured plan:", err);
        return { attributes: knownAttributes, followups: [] };
    }
}
