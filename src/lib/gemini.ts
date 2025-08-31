import { z } from "zod";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const GeminiMealItemSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  items: z.array(z.string()).default([]),
  has_carb: z.boolean(),
  has_protein: z.boolean(),
  has_veggies: z.boolean(),
  notes: z.string().default(""),
});

export const GeminiMealRecordSchema = z.object({
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meals: z.array(GeminiMealItemSchema),
});

export type GeminiMealItem = z.infer<typeof GeminiMealItemSchema>;
export type GeminiMealRecord = z.infer<typeof GeminiMealRecordSchema>;

/**
 * Prepare prompt and call Gemini 1.5-flash to extract structured meal data from a text message.
 */
export async function analyzeFoodMessageWithGemini(params: {
  userId: string;
  date: string;
  message: string;
}): Promise<GeminiMealRecord> {
  const { userId, date, message } = params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY env var");

  const systemInstruction = `You are a nutrition logging parser. Extract meals precisely and return ONLY valid minified JSON that matches this schema:
{
  "userId": "string",
  "date": "YYYY-MM-DD",
  "meals": [{
    "time": "HH:MM",
    "type": "breakfast"|"lunch"|"dinner"|"snack",
    "items": ["string"],
    "has_carb": boolean,
    "has_protein": boolean,
    "has_veggies": boolean,
    "notes": "string"
  }]
}

Rules:
- Only include meals explicitly present or strongly implied in the message.
- Infer time if not given: use the message timestamp's HH:MM.
- Classify meal type (breakfast/lunch/dinner/snack) based on time and content.
- Set boolean flags based on items (carbs: bread, pasta, rice, potato, cereal; protein: egg, meat, fish, poultry, tofu, dairy; veggies: salad, vegetable names).
- Items should be concise food names in the message language.
- Return ONLY JSON, no markdown, no prose.`;

  const userContent = `Message metadata:\n- userId: ${userId}\n- date: ${date}\n\nMessage text:\n${message}`;

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const body = {
    contents: [
      { role: "user", parts: [{ text: `${systemInstruction}\n\n${userContent}` }] },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 512,
    },
  } as const;

  const res = await fetch(`${url}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = (await res.json()) as any;
  const textOut = extractTextFromGeminiResponse(data);

  let parsed: unknown;
  try {
    parsed = JSON.parse(textOut);
  } catch {
    throw new Error("Gemini returned non-JSON content");
  }

  const validated = GeminiMealRecordSchema.parse(parsed);
  return validated;
}

function extractTextFromGeminiResponse(data: any): string {
  const partText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof partText === "string" && partText.trim()) return partText.trim();
  const parts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("");
    if (joined.trim()) return joined.trim();
  }
  throw new Error("Gemini response missing text");
}


