import { prisma } from "@/lib/db";
import { normalizeDateToUTC } from "@/lib/dates";
import { calculateDailyScore } from "@/lib/scoring";
import type { Meal, IdealDiet, IdealDietMealRule, Prisma } from "@prisma/client";

type DietWithRules = IdealDiet & { mealRules: IdealDietMealRule[] };

export async function recalcDailyScores(params: {
  userId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}): Promise<{ userId: string; date: Date; score: number }[]> {
  const { userId, from, to } = params;
  const fromUTC = normalizeDateToUTC(from);
  const toUTC = normalizeDateToUTC(to);

  const [diet, meals] = await Promise.all([
    prisma.idealDiet.findUnique({ where: { userId }, include: { mealRules: true } }),
    prisma.meal.findMany({
      where: { userId, date: { gte: fromUTC, lte: toUTC } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    }),
  ]);

  // Group meals by Date value of Meal.date (UTC midnight stored)
  const groups = new Map<string, Meal[]>();
  for (const m of meals) {
    const key = m.date.toISOString();
    const arr = groups.get(key) || [];
    arr.push(m);
    groups.set(key, arr);
  }

  const results: { userId: string; date: Date; score: number }[] = [];

  for (const [isoDate, dayMeals] of groups.entries()) {
    const mealsInput = dayMeals.map((m) => ({
      time: m.time,
      type: m.type,
      has_carb: m.has_carb,
      has_protein: m.has_protein,
      has_veggies: m.has_veggies,
    }));

    const breakdown = calculateDailyScore(mealsInput, diet as DietWithRules | null);
    const date = new Date(isoDate);

    const detailsJson: Prisma.InputJsonValue = (breakdown as unknown) as Prisma.InputJsonValue;
    await prisma.dailyScore.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, score: breakdown.total, details: detailsJson },
      update: { score: breakdown.total, details: detailsJson },
    });

    results.push({ userId, date, score: breakdown.total });
  }

  return results;
}

export async function getDailyScores(params: {
  userId: string;
  from: string;
  to: string;
}): Promise<{ id: string; userId: string; date: Date; score: number; details: unknown }[]> {
  const { userId, from, to } = params;
  const fromUTC = normalizeDateToUTC(from);
  const toUTC = normalizeDateToUTC(to);

  const scores = await prisma.dailyScore.findMany({
    where: { userId, date: { gte: fromUTC, lte: toUTC } },
    orderBy: [{ date: "asc" }],
  });
  return scores;
}


