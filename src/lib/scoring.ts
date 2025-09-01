import { MealType } from "@prisma/client";

export type AxisKey = "carb" | "protein" | "veggies";

export interface MealInput {
  time: string; // HH:MM
  type: MealType;
  has_carb: boolean;
  has_protein: boolean;
  has_veggies: boolean;
}

export interface IdealDietDaily {
  ideal_carb: boolean;
  ideal_protein: boolean;
  ideal_veggies: boolean;
}

export interface IdealDietMealRuleInput {
  mealType: MealType;
  expect_carb: boolean;
  expect_protein: boolean;
  expect_veggies: boolean;
}

export interface IdealDietInput extends IdealDietDaily {
  mealRules?: IdealDietMealRuleInput[];
}

export interface ScoringConfig {
  POINTS_AXIS: number; // 10
  POINTS_RULE: number; // 5
  BONUS_VARIETY: number; // 10
  PENALTY_NONE: number; // 10
  POINTS_PERFECT_MATCH: number; // 15 - Coincide completamente en tipo y nutrientes
  POINTS_PARTIAL_MATCH: number; // 8 - Coincide parcialmente
  POINTS_LOW_MATCH: number; // 3 - Coincide poco
}

export const DefaultScoringConfig: ScoringConfig = {
  POINTS_AXIS: 10,
  POINTS_RULE: 5,
  BONUS_VARIETY: 10,
  PENALTY_NONE: 10,
  POINTS_PERFECT_MATCH: 15,
  POINTS_PARTIAL_MATCH: 8,
  POINTS_LOW_MATCH: 3,
};

export interface ScoreBreakdown {
  axes: {
    carb: boolean;
    protein: boolean;
    veggies: boolean;
    points: number; // subtotal
  };
  mealRules: Array<{ mealType: MealType; met: boolean; points: number }>;
  mealMatching: Array<{
    mealType: MealType;
    hasMeal: boolean;
    expectedNutrients: { carb: boolean; protein: boolean; veggies: boolean };
    actualNutrients: { carb: boolean; protein: boolean; veggies: boolean };
    matchLevel: 'perfect' | 'partial' | 'low' | 'none';
    points: number;
  }>;
  varietyBonus: { earned: boolean; points: number };
  penaltyNone: { applied: boolean; points: number };
  total: number;
}

export function calculateDailyScore(
  meals: MealInput[],
  diet: IdealDietInput | null,
  config: ScoringConfig = DefaultScoringConfig
): ScoreBreakdown {
  const effectiveDiet: IdealDietInput = diet || {
    ideal_carb: true,
    ideal_protein: true,
    ideal_veggies: true,
    mealRules: [],
  };

  const hasAny = {
    carb: meals.some((m) => m.has_carb),
    protein: meals.some((m) => m.has_protein),
    veggies: meals.some((m) => m.has_veggies),
  };

  const axisEarned = {
    carb: effectiveDiet.ideal_carb && hasAny.carb,
    protein: effectiveDiet.ideal_protein && hasAny.protein,
    veggies: effectiveDiet.ideal_veggies && hasAny.veggies,
  };

  const axesPoints =
    (axisEarned.carb ? config.POINTS_AXIS : 0) +
    (axisEarned.protein ? config.POINTS_AXIS : 0) +
    (axisEarned.veggies ? config.POINTS_AXIS : 0);

  // Enhanced meal matching logic
  const rules = effectiveDiet.mealRules || [];
  const mealMatchingResults: Array<{
    mealType: MealType;
    hasMeal: boolean;
    expectedNutrients: { carb: boolean; protein: boolean; veggies: boolean };
    actualNutrients: { carb: boolean; protein: boolean; veggies: boolean };
    matchLevel: 'perfect' | 'partial' | 'low' | 'none';
    points: number;
  }> = rules.map((rule) => {
    const matchingMeals = meals.filter((m) => m.type === rule.mealType);
    const hasMeal = matchingMeals.length > 0;

    if (!hasMeal) {
      return {
        mealType: rule.mealType,
        hasMeal: false,
        expectedNutrients: { carb: rule.expect_carb, protein: rule.expect_protein, veggies: rule.expect_veggies },
        actualNutrients: { carb: false, protein: false, veggies: false },
        matchLevel: 'none' as const,
        points: 0,
      };
    }

    // Use the first matching meal (if multiple, we could improve this logic)
    const actualMeal = matchingMeals[0];
    const actualNutrients = {
      carb: actualMeal.has_carb,
      protein: actualMeal.has_protein,
      veggies: actualMeal.has_veggies,
    };

    // Calculate matching level
    let matches = 0;
    let totalExpected = 0;

    if (rule.expect_carb) {
      totalExpected++;
      if (actualMeal.has_carb) matches++;
    }
    if (rule.expect_protein) {
      totalExpected++;
      if (actualMeal.has_protein) matches++;
    }
    if (rule.expect_veggies) {
      totalExpected++;
      if (actualMeal.has_veggies) matches++;
    }

    let matchLevel: 'perfect' | 'partial' | 'low' | 'none';
    let points = 0;

    if (totalExpected === 0) {
      // No nutrients expected for this meal
      matchLevel = 'none';
      points = 0;
    } else if (matches === totalExpected) {
      // Perfect match - all expected nutrients present
      matchLevel = 'perfect';
      points = config.POINTS_PERFECT_MATCH;
    } else if (matches >= Math.ceil(totalExpected / 2)) {
      // Partial match - at least half of expected nutrients
      matchLevel = 'partial';
      points = config.POINTS_PARTIAL_MATCH;
    } else if (matches > 0) {
      // Low match - some nutrients but less than half
      matchLevel = 'low';
      points = config.POINTS_LOW_MATCH;
    } else {
      // No match - none of the expected nutrients
      matchLevel = 'none';
      points = 0;
    }

    return {
      mealType: rule.mealType,
      hasMeal: true,
      expectedNutrients: { carb: rule.expect_carb, protein: rule.expect_protein, veggies: rule.expect_veggies },
      actualNutrients,
      matchLevel,
      points,
    };
  });

  const mealMatchingPoints = mealMatchingResults.reduce((sum, r) => sum + r.points, 0);

  // Keep original rules calculation for backward compatibility
  const mealRulesResults: Array<{ mealType: MealType; met: boolean; points: number }> = rules.map(
    (rule) => {
      const matchingMeals = meals.filter((m) => m.type === rule.mealType);
      const met = matchingMeals.some(
        (m) =>
          (!rule.expect_carb || m.has_carb) &&
          (!rule.expect_protein || m.has_protein) &&
          (!rule.expect_veggies || m.has_veggies)
      );
      return { mealType: rule.mealType, met, points: met ? config.POINTS_RULE : 0 };
    }
  );

  // Variety bonus: if at least two meals together cover all three axes
  let varietyEarned = false;
  for (let i = 0; i < meals.length && !varietyEarned; i++) {
    for (let j = i + 1; j < meals.length && !varietyEarned; j++) {
      const m1 = meals[i];
      const m2 = meals[j];
      const c = m1.has_carb || m2.has_carb;
      const p = m1.has_protein || m2.has_protein;
      const v = m1.has_veggies || m2.has_veggies;
      if (c && p && v) varietyEarned = true;
    }
  }
  const varietyPoints = varietyEarned ? config.BONUS_VARIETY : 0;

  // Penalty: if no axis met at all (ignoring diet toggles, we consider raw axes)
  const noAxisMet = !hasAny.carb && !hasAny.protein && !hasAny.veggies;
  const penaltyApplied = noAxisMet;
  const penaltyPoints = penaltyApplied ? -config.PENALTY_NONE : 0;

  const total = axesPoints + mealMatchingPoints + varietyPoints + penaltyPoints;

  return {
    axes: { carb: axisEarned.carb, protein: axisEarned.protein, veggies: axisEarned.veggies, points: axesPoints },
    mealRules: mealRulesResults, // Keep for backward compatibility
    mealMatching: mealMatchingResults, // New enhanced matching
    varietyBonus: { earned: varietyEarned, points: varietyPoints },
    penaltyNone: { applied: penaltyApplied, points: penaltyPoints },
    total,
  };
}


