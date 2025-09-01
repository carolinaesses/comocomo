import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { recalcDailyScores } from "@/lib/scoring-service";

const RuleSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  expect_carb: z.boolean(),
  expect_protein: z.boolean(),
  expect_veggies: z.boolean(),
});

const DietSchema = z.object({
  userId: z.string(),
  ideal_carb: z.boolean(),
  ideal_protein: z.boolean(),
  ideal_veggies: z.boolean(),
  notes: z.string().optional(),
  mealRules: z.array(RuleSchema).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const diet = await prisma.idealDiet.findUnique({ where: { userId }, include: { mealRules: true } });
    return NextResponse.json(diet);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = DietSchema.parse(json);

    const upserted = await prisma.idealDiet.upsert({
      where: { userId: body.userId },
      create: {
        userId: body.userId,
        ideal_carb: body.ideal_carb,
        ideal_protein: body.ideal_protein,
        ideal_veggies: body.ideal_veggies,
        notes: body.notes ?? null,
        mealRules: body.mealRules && body.mealRules.length > 0 ? {
          create: body.mealRules.map((r) => ({
            mealType: r.mealType,
            expect_carb: r.expect_carb,
            expect_protein: r.expect_protein,
            expect_veggies: r.expect_veggies,
          })),
        } : undefined,
      },
      update: {
        ideal_carb: body.ideal_carb,
        ideal_protein: body.ideal_protein,
        ideal_veggies: body.ideal_veggies,
        notes: body.notes ?? null,
        mealRules: {
          deleteMany: {},
          create: (body.mealRules || []).map((r) => ({
            mealType: r.mealType,
            expect_carb: r.expect_carb,
            expect_protein: r.expect_protein,
            expect_veggies: r.expect_veggies,
          })),
        },
      },
      include: { mealRules: true },
    });

    // Optionally trigger recalculation for last 30 days
    const today = new Date();
    const to = new Date(today.getTime());
    const from = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
    const toStr = `${to.getUTCFullYear()}-${String(to.getUTCMonth() + 1).padStart(2, "0")}-${String(to.getUTCDate()).padStart(2, "0")}`;
    const fromStr = `${from.getUTCFullYear()}-${String(from.getUTCMonth() + 1).padStart(2, "0")}-${String(from.getUTCDate()).padStart(2, "0")}`;
    await recalcDailyScores({ userId: body.userId, from: fromStr, to: toStr });

    return NextResponse.json(upserted);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}


