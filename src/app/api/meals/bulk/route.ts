import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { normalizeDateToUTC } from "@/lib/dates";
import { recalcDailyScores } from "@/lib/scoring-service";

const BulkSchema = z.object({
  records: z.array(
    z.object({
      userId: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      items: z.string(),
      has_carb: z.boolean(),
      has_protein: z.boolean(),
      has_veggies: z.boolean(),
      notes: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = BulkSchema.parse(json);

    const data = body.records.map((r) => ({
      userId: r.userId,
      date: normalizeDateToUTC(r.date),
      time: r.time,
      type: r.type,
      items: r.items,
      has_carb: r.has_carb,
      has_protein: r.has_protein,
      has_veggies: r.has_veggies,
      notes: r.notes ?? null,
    }));

    const created = await prisma.$transaction(
      data.map((d) =>
        prisma.meal.upsert({
          where: { userId_date_time_type_items: { userId: d.userId, date: d.date, time: d.time, type: d.type, items: d.items } },
          create: d,
          update: {},
        })
      )
    );

    // Recalculate scores per day touched
    const byUserDate = new Map<string, Set<string>>();
    for (const r of body.records) {
      const key = r.userId;
      const set = byUserDate.get(key) || new Set<string>();
      set.add(r.date);
      byUserDate.set(key, set);
    }
    for (const [userId, dates] of byUserDate.entries()) {
      const sorted = Array.from(dates).sort();
      const from = sorted[0];
      const to = sorted[sorted.length - 1];
      await recalcDailyScores({ userId, from, to });
    }

    return NextResponse.json({ inserted: created.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}


