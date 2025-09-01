import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { normalizeDateToUTC } from "@/lib/dates";
import { recalcDailyScores } from "@/lib/scoring-service";

const MealCreateSchema = z.object({
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  items: z.string(),
  has_carb: z.boolean(),
  has_protein: z.boolean(),
  has_veggies: z.boolean(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = MealCreateSchema.parse(json);
    const dateUTC = normalizeDateToUTC(body.date);

    const meal = await prisma.meal.create({
      data: {
        userId: body.userId,
        date: dateUTC,
        time: body.time,
        type: body.type,
        items: body.items,
        has_carb: body.has_carb,
        has_protein: body.has_protein,
        has_veggies: body.has_veggies,
        notes: body.notes ?? null,
      },
    });
    // trigger score recalculation for that day
    const dateStr = body.date;
    await recalcDailyScores({ userId: body.userId, from: dateStr, to: dateStr });
    return NextResponse.json(meal);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!userId || !from || !to) {
      return NextResponse.json({ error: "Missing userId/from/to" }, { status: 400 });
    }
    const fromUTC = normalizeDateToUTC(from);
    const toUTC = normalizeDateToUTC(to);
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: { gte: fromUTC, lte: toUTC },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return NextResponse.json(meals);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}


