import { NextRequest, NextResponse } from "next/server";
import { extractFoodMessages } from "@/lib/parser";
import { analyzeFoodMessageWithGemini } from "@/lib/gemini";
import { appendRowsToSheet, SheetRow } from "@/lib/sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("text/plain") && !contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected text/plain or multipart/form-data" }, { status: 400 });
    }

    let text = "";
    if (contentType.includes("text/plain")) {
      text = await req.text();
    } else {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file instanceof File) {
        text = await file.text();
      } else {
        return NextResponse.json({ error: "Missing file field" }, { status: 400 });
      }
    }

    const foodMessages = extractFoodMessages(text);
    if (foodMessages.length === 0) {
      return NextResponse.json({ processed: 0, appended: 0, records: [] });
    }

    const records: { inputText: string; record: { userId: string; date: string; meals: { time: string; type: string; items: string[]; has_carb: boolean; has_protein: boolean; has_veggies: boolean; notes: string }[] } }[] = [];
    for (const msg of foodMessages) {
      const record = await analyzeFoodMessageWithGemini({ userId: msg.user, date: msg.date, message: msg.text });
      records.push({ inputText: msg.text, record });
    }

    // Flatten to sheet rows
    const rows: SheetRow[] = [];
    for (const { record } of records) {
      for (const meal of record.meals) {
        rows.push({
          date: record.date,
          time: meal.time,
          type: meal.type,
          items: meal.items.join(", "),
          has_carb: meal.has_carb,
          has_protein: meal.has_protein,
          has_veggies: meal.has_veggies,
          userId: record.userId,
          notes: meal.notes || "",
        });
      }
    }

    const result = await appendRowsToSheet(rows);

    return NextResponse.json({ processed: foodMessages.length, appended: result.appended, records });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


