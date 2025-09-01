"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/lib/use-user";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type IdealDietRule = {
  mealType: MealType;
  expect_carb: boolean;
  expect_protein: boolean;
  expect_veggies: boolean;
};

type IdealDiet = {
  id: string;
  userId: string;
  ideal_carb: boolean;
  ideal_protein: boolean;
  ideal_veggies: boolean;
  notes?: string | null;
  mealRules: IdealDietRule[];
};

export default function IdealDietPage() {
  const { userId } = useUser();
  const [diet, setDiet] = useState<IdealDiet | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDiet = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideal-diet?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data) {
        setDiet(data);
      } else {
        // No diet exists, set defaults
        setDiet({
          id: "",
          userId,
          ideal_carb: true,
          ideal_protein: true,
          ideal_veggies: true,
          notes: "",
          mealRules: [
            { mealType: "breakfast", expect_carb: true, expect_protein: true, expect_veggies: false },
            { mealType: "lunch", expect_carb: true, expect_protein: true, expect_veggies: true },
            { mealType: "dinner", expect_carb: false, expect_protein: true, expect_veggies: true },
            { mealType: "snack", expect_carb: false, expect_protein: false, expect_veggies: false },
          ],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching diet");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  async function saveDiet() {
    if (!diet) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body = {
        userId: diet.userId,
        ideal_carb: diet.ideal_carb,
        ideal_protein: diet.ideal_protein,
        ideal_veggies: diet.ideal_veggies,
        notes: diet.notes,
        mealRules: diet.mealRules,
      };
      const res = await fetch("/api/ideal-diet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDiet(data);
      setSuccess("Plan ideal guardado y scores recalculados!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error saving diet");
    } finally {
      setSaving(false);
    }
  }

  // Auto-load diet when userId becomes available
  useEffect(() => {
    if (userId) {
      fetchDiet();
    }
  }, [userId, fetchDiet]);

  if (!diet && !loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-semibold text-center">🎯 Plan Ideal</h1>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-gray-600">Configura tus objetivos nutricionales</div>
        </div>
        {error && <div className="text-red-600 text-center">{error}</div>}
      </div>
    );
  }

  if (!diet) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold text-center">🎯 Plan Ideal</h1>

      {!userId && (
        <div className="text-center py-4 text-gray-500">
          Inicia sesión para configurar tu dieta
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
        <h2 className="text-base font-medium mb-4 text-center text-white">🎯 Objetivos Diarios</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={diet.ideal_carb}
              onChange={(e) => setDiet({ ...diet, ideal_carb: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-200">🍞 Carbohidratos</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={diet.ideal_protein}
              onChange={(e) => setDiet({ ...diet, ideal_protein: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-200">🥩 Proteína</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={diet.ideal_veggies}
              onChange={(e) => setDiet({ ...diet, ideal_veggies: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-200">🥕 Verduras</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
        <h2 className="text-base font-medium mb-6 text-center text-white">📋 Plan por Comida</h2>
        <div className="grid grid-cols-1 gap-4">
          {diet.mealRules.map((rule, idx) => {
            const mealTypeLabels = {
              breakfast: "☀️ Desayuno",
              lunch: "🌞 Almuerzo",
              snack: "🍪 Merienda",
              dinner: "🌙 Cena"
            };

            return (
              <div key={rule.mealType} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                <h3 className="font-medium text-sm mb-4 text-center text-white">
                  {mealTypeLabels[rule.mealType as keyof typeof mealTypeLabels]}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={rule.expect_carb}
                      onChange={(e) => {
                        const newRules = [...diet.mealRules];
                        newRules[idx] = { ...rule, expect_carb: e.target.checked };
                        setDiet({ ...diet, mealRules: newRules });
                      }}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-200">🍞 Carbohidratos</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={rule.expect_protein}
                      onChange={(e) => {
                        const newRules = [...diet.mealRules];
                        newRules[idx] = { ...rule, expect_protein: e.target.checked };
                        setDiet({ ...diet, mealRules: newRules });
                      }}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-200">🥩 Proteína</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={rule.expect_veggies}
                      onChange={(e) => {
                        const newRules = [...diet.mealRules];
                        newRules[idx] = { ...rule, expect_veggies: e.target.checked };
                        setDiet({ ...diet, mealRules: newRules });
                      }}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-200">🥕 Verduras</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
        <h2 className="text-base font-medium mb-4 text-center text-white">📝 Notas</h2>
        <textarea
          className="bg-gray-700 border border-gray-600 rounded-lg w-full p-3 h-20 text-sm text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Indicaciones adicionales..."
          value={diet.notes || ""}
          onChange={(e) => setDiet({ ...diet, notes: e.target.value })}
        />
      </div>

      <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-3 text-sm w-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={saveDiet} disabled={saving}>
        {saving ? "💾 Guardando..." : "💾 Guardar Plan"}
      </button>

      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </div>
  );
}
