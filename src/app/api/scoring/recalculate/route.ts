import { NextRequest, NextResponse } from "next/server";
import { recalcDailyScores } from "@/lib/scoring-service";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!userId || !from || !to) {
      return NextResponse.json({ error: "Missing userId/from/to" }, { status: 400 });
    }
    const results = await recalcDailyScores({ userId, from, to });
    return NextResponse.json({ success: true, count: results.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}


