import { NextRequest, NextResponse } from "next/server";
import { getDailyScores } from "@/lib/scoring-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!userId || !from || !to) {
      return NextResponse.json({ error: "Missing userId/from/to" }, { status: 400 });
    }
    const data = await getDailyScores({ userId, from, to });
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}


