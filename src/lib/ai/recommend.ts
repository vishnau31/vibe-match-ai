import { openai } from "@/lib/openai"; // assumes your existing OpenAI wrapper
import apparels from "@/data/apparels.json";

export type Apparel = {
    id: string;
    category: string;
    available_sizes: string;
    fit: string;
    fabric: string;
    sleeve_length: string;
    price: number;
    [key: string]: string | number | string[];
};

export function recommendSKUsFrom(
    attributes: Record<string, string | number | string[]>,
    limit = 20
): Apparel[] {
    return apparels.map(item => ({
        ...item,
        price: parseFloat(item.price)
    })).filter((item) => {
        if (attributes.category && Array.isArray(attributes.category) && !attributes.category.includes(item.category))
            return false;

        if (
            attributes.size &&
            Array.isArray(attributes.size) &&
            !attributes.size.some((s: string) =>
                item.available_sizes?.split(",").includes(s)
            )
        )
            return false;

        if (
            attributes.fit &&
            item.fit &&
            typeof item.fit === 'string' &&
            typeof attributes.fit === 'string' &&
            item.fit.toLowerCase() !== attributes.fit.toLowerCase()
        )
            return false;

        if (
            attributes.fabric &&
            Array.isArray(attributes.fabric) &&
            !attributes.fabric.some((f: string) =>
                item.fabric?.toLowerCase().includes(f.toLowerCase())
            )
        )
            return false;

        if (
            attributes.sleeve_length &&
            item.sleeve_length &&
            typeof item.sleeve_length === 'string' &&
            typeof attributes.sleeve_length === 'string' &&
            item.sleeve_length.toLowerCase() !==
            attributes.sleeve_length.toLowerCase()
        )
            return false;

        if (
            attributes.price_max &&
            item.price &&
            Number(item.price) > Number(attributes.price_max)
        )
            return false;

        return true;
    }).slice(0, limit);
}


export async function smartRecommendWithLLM(attributes: Record<string, string | number | string[]>) {
    const initialPool = recommendSKUsFrom(attributes, 20);

    const prompt = `
        You are a smart fashion assistant helping a shopper.
        You are given a list of available clothing options and a shopper's inferred preferences.
        Here is the shopper's vibe:
        Here are the shopper's inferred preferences:
        ${JSON.stringify(attributes, null, 2)}

        Here are some available clothing options:
        ${JSON.stringify(initialPool, null, 2)}

        Pick the best 5 items. Respond with a JSON like:

        {
            "recommendations": [ ...top 5 sku objects... ],
            "justification": "Why these were selected"
        }
  `;



    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
    });
    const raw = completion.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```(?:json)?|```/g, "").trim();

    try {
        const parsed = JSON.parse(clean);
        return {
            recommendations: parsed.recommendations || [],
            justification: parsed.justification || "These match your vibe well!",
        };
    } catch (err) {
        console.error("LLM response parse failed:", err);
        return {
            recommendations: [],
            justification: "Couldn't generate personalized suggestions, try again.",
        };
    }
}

