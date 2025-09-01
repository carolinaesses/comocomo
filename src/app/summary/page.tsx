"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/lib/use-user";

type ScoreDetails = {
  axes: {
    carb: boolean;
    protein: boolean;
    veggies: boolean;
    points: number;
  };
  mealRules: Array<{ mealType: string; met: boolean; points: number }>;
  varietyBonus: { earned: boolean; points: number };
  penaltyNone: { applied: boolean; points: number };
  total: number;
};

type DailyScore = {
  id: string;
  userId: string;
  date: string;
  score: number;
  details: ScoreDetails;
};

type Meal = {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  items: string;
  has_carb: boolean;
  has_protein: boolean;
  has_veggies: boolean;
  notes?: string | null;
};

type IdealDiet = {
  id: string;
  userId: string;
  ideal_carb: boolean;
  ideal_protein: boolean;
  ideal_veggies: boolean;
  notes?: string | null;
  mealRules: Array<{
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    expect_carb: boolean;
    expect_protein: boolean;
    expect_veggies: boolean;
  }>;
};

export default function SummaryPage() {
  const { userId } = useUser();
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{
    scores: DailyScore[];
    meals: Meal[];
    diet: IdealDiet | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [mealsRes, scoresRes, dietRes] = await Promise.all([
        fetch(`/api/meals?userId=${encodeURIComponent(userId)}&from=${from}&to=${to}`),
        fetch(`/api/scoring/daily?userId=${encodeURIComponent(userId)}&from=${from}&to=${to}`),
        fetch(`/api/ideal-diet?userId=${encodeURIComponent(userId)}`),
      ]);

      if (!mealsRes.ok) throw new Error("Error fetching meals");
      if (!scoresRes.ok) throw new Error("Error fetching scores");
      if (!dietRes.ok) throw new Error("Error fetching diet");

      const meals: Meal[] = await mealsRes.json();
      const scores: DailyScore[] = await scoresRes.json();
      const diet: IdealDiet | null = await dietRes.json();

      setData({ scores, meals, diet });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [userId, from, to]);

  // Auto-load summary when userId becomes available
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, from, to, fetchData]);

  if (!data && !loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-semibold text-center">📊 Resumen y Estadísticas</h1>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded px-3 py-2 text-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input className="border rounded px-3 py-2 text-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm w-full" onClick={fetchData} disabled={loading}>
            {loading ? "Cargando..." : "Generar Reporte"}
          </button>
        </div>

        {!userId && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-sm">Inicia sesión para ver tus estadísticas</div>
          </div>
        )}

        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  const { scores, meals, diet } = data;

  // Group meals by date
  const mealsByDate = new Map<string, Meal[]>();
  for (const meal of meals) {
    const key = meal.date.slice(0, 10);
    const arr = mealsByDate.get(key) || [];
    arr.push(meal);
    mealsByDate.set(key, arr);
  }

  // Calculate axis compliance %
  const totalDays = new Set([...mealsByDate.keys(), ...scores.map((s) => s.date.slice(0, 10))]).size;
  let carbDays = 0, proteinDays = 0, veggiesDays = 0;
  for (const [, dayMeals] of mealsByDate) {
    if (dayMeals.some((m) => m.has_carb)) carbDays++;
    if (dayMeals.some((m) => m.has_protein)) proteinDays++;
    if (dayMeals.some((m) => m.has_veggies)) veggiesDays++;
  }
  const carbPct = totalDays > 0 ? (carbDays / totalDays * 100).toFixed(1) : "0.0";
  const proteinPct = totalDays > 0 ? (proteinDays / totalDays * 100).toFixed(1) : "0.0";
  const veggiesPct = totalDays > 0 ? (veggiesDays / totalDays * 100).toFixed(1) : "0.0";

  // Meal rule compliance %
  const ruleStats = new Map<string, { total: number; met: number }>();
  if (diet) {
    for (const rule of diet.mealRules) {
      ruleStats.set(rule.mealType, { total: 0, met: 0 });
    }
  }
  for (const [, dayMeals] of mealsByDate) {
    for (const meal of dayMeals) {
      const stats = ruleStats.get(meal.type);
      if (stats) {
        stats.total++;
        const rule = diet?.mealRules.find((r) => r.mealType === meal.type);
        if (rule) {
          const met =
            (!rule.expect_carb || meal.has_carb) &&
            (!rule.expect_protein || meal.has_protein) &&
            (!rule.expect_veggies || meal.has_veggies);
          if (met) stats.met++;
        }
      }
    }
  }
  const rulePcts = Array.from(ruleStats.entries()).map(([type, stats]) => ({
    type,
    pct: stats.total > 0 ? (stats.met / stats.total * 100).toFixed(1) : "0.0",
  }));

  // Score series
  const scoreSeries = scores.sort((a, b) => a.date.localeCompare(b.date)).map((s) => ({
    date: s.date.slice(0, 10),
    score: s.score,
  }));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold text-center">📊 Resumen y Estadísticas</h1>

              <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
          <input className="border rounded px-3 py-2 text-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="border rounded px-3 py-2 text-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm w-full" onClick={fetchData} disabled={loading}>
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-medium mb-3 text-center">🎯 Cumplimiento de Ejes Diarios</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <span className="text-sm flex items-center gap-2"><span className="text-lg">🍞</span> Carbohidratos</span>
              <span className="font-bold text-lg">{carbPct}%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="text-sm flex items-center gap-2"><span className="text-lg">🥩</span> Proteína</span>
              <span className="font-bold text-lg">{proteinPct}%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm flex items-center gap-2"><span className="text-lg">🥕</span> Verduras</span>
              <span className="font-bold text-lg">{veggiesPct}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-medium mb-3 text-center">📋 Cumplimiento por Comida</h2>
          <div className="space-y-2">
            {rulePcts.map((item) => (
              <div key={item.type} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm capitalize">{item.type}</span>
                <span className="font-bold text-lg">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-medium mb-3 text-center">📈 Serie de Scores</h2>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {scoreSeries.map((item) => (
              <div key={item.date} className="flex justify-between items-center text-sm p-1">
                <span className="text-gray-600">{item.date}</span>
                <span className={`font-bold ${
                  item.score < 20 ? "text-red-600" :
                  item.score < 40 ? "text-yellow-600" :
                  "text-green-600"
                }`}>
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h2 className="text-base font-medium mb-4 text-center">📊 Métricas Generales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalDays}</div>
            <div className="text-xs text-gray-600">Días analizados</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{meals.length}</div>
            <div className="text-xs text-gray-600">Comidas registradas</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">{scores.length}</div>
            <div className="text-xs text-gray-600">Scores calculados</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {scores.length > 0 ? (scores.reduce((s, sc) => s + sc.score, 0) / scores.length).toFixed(1) : "0.0"}
            </div>
            <div className="text-xs text-gray-600">Score promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
}
