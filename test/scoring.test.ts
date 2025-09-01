import { describe, it, expect } from "vitest";
import { calculateDailyScore, DefaultScoringConfig, IdealDietInput, MealInput } from "@/lib/scoring";

const MEALS_BASE: MealInput[] = [
  { time: "08:00", type: "breakfast", has_carb: true, has_protein: true, has_veggies: false },
  { time: "13:00", type: "lunch", has_carb: true, has_protein: true, has_veggies: true },
  { time: "20:00", type: "dinner", has_carb: false, has_protein: true, has_veggies: true },
];

describe("calculateDailyScore", () => {
  it("awards daily axes correctly when ideal toggles are true", () => {
    const diet: IdealDietInput = {
      ideal_carb: true,
      ideal_protein: true,
      ideal_veggies: true,
      mealRules: [],
    };
    const res = calculateDailyScore(MEALS_BASE, diet, DefaultScoringConfig);
    expect(res.axes.points).toBe(30);
    expect(res.total).toBeGreaterThanOrEqual(30);
  });

  it("ignores an axis if ideal toggle is false", () => {
    const diet: IdealDietInput = {
      ideal_carb: false,
      ideal_protein: true,
      ideal_veggies: true,
      mealRules: [],
    };
    const res = calculateDailyScore(MEALS_BASE, diet, DefaultScoringConfig);
    expect(res.axes.carb).toBe(false);
    expect(res.axes.points).toBe(20);
  });

    it("applies meal rules for matching meals", () => {
    const diet: IdealDietInput = {
      ideal_carb: true,
      ideal_protein: true,
      ideal_veggies: true,
      mealRules: [
        { mealType: "breakfast", expect_carb: true, expect_protein: true, expect_veggies: false },
        { mealType: "lunch", expect_carb: true, expect_protein: true, expect_veggies: true },
        { mealType: "dinner", expect_carb: false, expect_protein: true, expect_veggies: true },
      ],
    };
    const res = calculateDailyScore(MEALS_BASE, diet, DefaultScoringConfig);
    // 3 rules met => 3 * 5 = 15
    const rulesPoints = res.mealRules.reduce((s, r) => s + r.points, 0);
    expect(rulesPoints).toBe(15);
  });

  it("grants variety bonus if two meals together cover all axes", () => {
    const diet: IdealDietInput = {
      ideal_carb: true,
      ideal_protein: true,
      ideal_veggies: true,
      mealRules: [],
    };
    const meals: MealInput[] = [
      { time: "09:00", type: "breakfast", has_carb: true, has_protein: false, has_veggies: false },
      { time: "13:00", type: "lunch", has_carb: false, has_protein: true, has_veggies: true },
    ];
    const res = calculateDailyScore(meals, diet, DefaultScoringConfig);
    expect(res.varietyBonus.earned).toBe(true);
    expect(res.varietyBonus.points).toBe(DefaultScoringConfig.BONUS_VARIETY);
  });

  it("applies penalty when no axis met at all", () => {
    const diet: IdealDietInput = {
      ideal_carb: true,
      ideal_protein: true,
      ideal_veggies: true,
      mealRules: [],
    };
    const meals: MealInput[] = [];
    const res = calculateDailyScore(meals, diet, DefaultScoringConfig);
    expect(res.penaltyNone.applied).toBe(true);
    expect(res.penaltyNone.points).toBe(-DefaultScoringConfig.PENALTY_NONE);
  });
});


