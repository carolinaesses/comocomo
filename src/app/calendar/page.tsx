"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/lib/use-user";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type Meal = {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: MealType;
  items: string;
  has_carb: boolean;
  has_protein: boolean;
  has_veggies: boolean;
  notes?: string | null;
};

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

type DayData = {
  date: string;
  score?: number;
  meals: Meal[];
  breakdown?: ScoreDetails;
};

export default function CalendarPage() {
  const { userId } = useUser();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  function getDaysInMonth(year: number, month: number): string[] {
    const days: string[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay()); // Start from Sunday
    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - lastDay.getDay())); // End on Saturday
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [year, month] = currentMonth.split("-").map(Number);
      const from = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const [mealsRes, scoresRes] = await Promise.all([
        fetch(`/api/meals?userId=${encodeURIComponent(userId)}&from=${from}&to=${to}`),
        fetch(`/api/scoring/daily?userId=${encodeURIComponent(userId)}&from=${from}&to=${to}`),
      ]);

      if (!mealsRes.ok) throw new Error("Error fetching meals");
      if (!scoresRes.ok) throw new Error("Error fetching scores");

      const meals: Meal[] = await mealsRes.json();
      const scores: DailyScore[] = await scoresRes.json();

      const daysInMonth = getDaysInMonth(year, month - 1);
      const dayMap = new Map<string, DayData>();
      for (const day of daysInMonth) {
        dayMap.set(day, { date: day, meals: [] });
      }

      // Group meals by date
      for (const meal of meals) {
        const key = meal.date.slice(0, 10);
        const dayData = dayMap.get(key);
        if (dayData) dayData.meals.push(meal);
      }

      // Add scores
      for (const score of scores) {
        const key = score.date.slice(0, 10);
        const dayData = dayMap.get(key);
        if (dayData) {
          dayData.score = score.score;
          dayData.breakdown = score.details;
        }
      }

      setDays(Array.from(dayMap.values()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, currentMonth, fetchData]);

  function getScoreColor(score?: number): string {
    if (score === undefined) return "bg-gray-100";
    if (score < 20) return "bg-red-200";
    if (score < 40) return "bg-yellow-200";
    return "bg-green-200";
  }

  function getWeekdays(): string[] {
    return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  }

  function isCurrentMonth(date: string): boolean {
    const [year, month] = currentMonth.split("-").map(Number);
    const d = new Date(date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold text-center">📅 Calendario de Scores</h1>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border rounded px-3 py-2 text-sm"
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
          />
          <button className="bg-blue-600 text-white rounded px-3 py-2 text-sm" onClick={fetchData} disabled={loading}>
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {!userId && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📅</div>
          <div className="text-sm">Inicia sesión para ver tu calendario</div>
        </div>
      )}

      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-7 gap-1">
        {getWeekdays().map((day) => (
          <div key={day} className="text-center font-medium p-2 bg-gray-100">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day.date}
            className={`border rounded p-2 min-h-24 cursor-pointer ${getScoreColor(day.score)} ${
              !isCurrentMonth(day.date) ? "opacity-50" : ""
            }`}
            onClick={() => setSelectedDay(day)}
          >
            <div className="text-sm font-medium">{new Date(day.date).getDate()}</div>
            {day.score !== undefined && <div className="text-xs mt-1">{day.score}</div>}
            {day.meals.length > 0 && (
              <div className="text-xs mt-1 opacity-75">{day.meals.length} comidas</div>
            )}
          </div>
        ))}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded shadow p-6 w-full max-w-2xl space-y-4">
            <h2 className="text-lg font-semibold">{new Date(selectedDay.date).toLocaleDateString()}</h2>
            <div className="text-sm">
              <strong>Score:</strong> {selectedDay.score ?? "Sin datos"}
            </div>
            {selectedDay.breakdown && (
              <div className="text-sm">
                <h3 className="font-medium">Breakdown:</h3>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Ejes: {selectedDay.breakdown.axes?.points ?? 0} pts</li>
                  <li>Reglas comidas: {selectedDay.breakdown.mealRules?.reduce((s: number, r: { points: number }) => s + r.points, 0) ?? 0} pts</li>
                  <li>Bonus variedad: {selectedDay.breakdown.varietyBonus?.points ?? 0} pts</li>
                  <li>Penalización: {selectedDay.breakdown.penaltyNone?.points ?? 0} pts</li>
                </ul>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-medium">Comidas:</h3>
              {selectedDay.meals.length === 0 ? (
                <div className="text-sm text-gray-600">Sin comidas registradas</div>
              ) : (
                <div className="space-y-1">
                  {selectedDay.meals.map((meal) => (
                    <div key={meal.id} className="text-sm border rounded p-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{meal.type} - {meal.time}</span>
                        <span>
                          {meal.has_carb && "C"} {meal.has_protein && "P"} {meal.has_veggies && "V"}
                        </span>
                      </div>
                      <div>{meal.items}</div>
                      {meal.notes && <div className="text-gray-600">{meal.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button className="bg-gray-600 text-white rounded px-4 py-2" onClick={() => setSelectedDay(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
