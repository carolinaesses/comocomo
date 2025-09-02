"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function thirtyDaysAgoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MealsPage() {
  const { userId } = useUser();
  const [from, setFrom] = useState(thirtyDaysAgoStr());
  const [to, setTo] = useState(todayStr());
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [axisFilter, setAxisFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState({
    date: todayStr(),
    time: "08:00",
    type: "breakfast" as MealType,
    items: "",
    has_carb: false,
    has_protein: false,
    has_veggies: false,
    notes: "",
  });

  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    processed?: number;
    error?: string;
    debug?: { totalMessages?: number; foodMessages?: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState(`{
  "records": [
    {"userId": "USER", "date": "2025-01-01", "time": "08:00", "type": "breakfast", "items": "tostadas, queso", "has_carb": true, "has_protein": true, "has_veggies": false, "notes": ""}
  ]
}`);

  const fetchMeals = useCallback(async () => {
    if (!userId || !from || !to) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meals?userId=${encodeURIComponent(userId)}&from=${from}&to=${to}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMeals(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching meals");
    } finally {
      setLoading(false);
    }
  }, [userId, from, to]);

  // Auto-load meals when userId becomes available
  useEffect(() => {
    if (userId) {
      fetchMeals();
    }
  }, [userId, from, to, fetchMeals]);

  const filtered = useMemo(() => {
    return meals.filter((m) => {
      if (typeFilter && m.type !== typeFilter) return false;
      if (axisFilter === "carb" && !m.has_carb) return false;
      if (axisFilter === "protein" && !m.has_protein) return false;
      if (axisFilter === "veggies" && !m.has_veggies) return false;
      return true;
    });
  }, [meals, typeFilter, axisFilter]);

  async function onCreateMeal() {
    if (!userId) return alert("Usuario no autenticado");
    try {
      const body = { userId, ...newMeal };
      const res = await fetch("/api/meals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      setShowAdd(false);
      await fetchMeals();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error creating meal");
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadLoading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ingest-txt", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Error uploading file");

      setUploadResult(result);

      // Refresh meals list if upload was successful
      if (result.processed > 0) {
        await fetchMeals();
      }

    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        error: error instanceof Error ? error.message : "Error uploading file"
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileUpload(file);
      handleFileUpload(file);
    }
  };

  async function onBulkImport() {
    try {
      const parsed = JSON.parse(bulkText);
      const res = await fetch("/api/meals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
        credentials: "include"
      });
      if (!res.ok) throw new Error(await res.text());
      setBulkOpen(false);
      await fetchMeals();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Invalid JSON or error in bulk import");
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold text-center text-white">🍽️ Gestionar Comidas</h1>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tipo (todos)</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <select
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={axisFilter}
              onChange={(e) => setAxisFilter(e.target.value)}
            >
              <option value="">Eje (todos)</option>
              <option value="carb">Carb</option>
              <option value="protein">Protein</option>
              <option value="veggies">Veggies</option>
            </select>
          </div>
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 transition-colors"
            onClick={fetchMeals}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Buscar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex gap-2">
          <button
            className="bg-green-600 text-white rounded px-3 py-2 text-sm flex-1 hover:bg-green-700 transition-colors"
            onClick={() => setShowAdd(true)}
          >
            ➕ Agregar Manual
          </button>
          <button
            className="bg-blue-600 text-white rounded px-3 py-2 text-sm flex-1 hover:bg-blue-700 transition-colors"
            onClick={handleImportClick}
            disabled={uploadLoading}
          >
            {uploadLoading ? (
              <>
                <span className="animate-spin mr-2">🤖</span>
                Procesando...
              </>
            ) : (
              <>
                📤 Subir WhatsApp
              </>
            )}
          </button>
        </div>
        <button
          className="bg-gray-600 text-white rounded px-3 py-2 text-sm hover:bg-gray-700 transition-colors"
          onClick={() => setBulkOpen(true)}
        >
          📄 Importar JSON
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <div className="text-red-400 text-sm text-center">{error}</div>}

      {/* Upload result feedback */}
      {uploadResult && (
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
          {uploadResult.error ? (
            <div className="text-red-400 text-center">
              <div className="text-lg mb-2">❌ Error</div>
              <div className="text-sm">{uploadResult.error}</div>
            </div>
          ) : (uploadResult.processed && uploadResult.processed > 0) ? (
            <div className="text-green-400 text-center">
              <div className="text-lg mb-2">✅ ¡Archivo procesado!</div>
              <div className="text-sm">
                {uploadResult.processed} comidas detectadas y guardadas
              </div>
              <div className="text-xs text-green-300 mt-2">
                Las comidas se han agregado a tu lista
              </div>
            </div>
          ) : (
            <div className="text-yellow-400 text-center">
              <div className="text-lg mb-2">⚠️ No se encontraron comidas</div>
              <div className="text-sm">
                {uploadResult.debug?.totalMessages || 0} mensajes encontrados, pero ninguno sobre alimentos
              </div>
              <div className="text-xs text-yellow-300 mt-2">
                Verifica que el archivo tenga mensajes sobre comidas
              </div>
            </div>
          )}
        </div>
      )}

      {/* File info */}
      {fileUpload && (
        <div className="text-center text-sm text-gray-400">
          📄 Archivo seleccionado: {fileUpload.name}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">🍽️</div>
            <div className="text-sm">No hay comidas registradas</div>
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium capitalize text-sm text-white">{m.type}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(m.date).toLocaleDateString()} • {m.time}
                  </div>
                </div>
                <div className="flex gap-1 text-xs">
                  {m.has_carb && <span className="bg-yellow-900 text-yellow-300 px-2 py-1 rounded">🍞</span>}
                  {m.has_protein && <span className="bg-red-900 text-red-300 px-2 py-1 rounded">🥩</span>}
                  {m.has_veggies && <span className="bg-green-900 text-green-300 px-2 py-1 rounded">🥕</span>}
                </div>
              </div>
              <div className="text-sm text-gray-300 mb-2">{m.items}</div>
              {m.notes && (
                <div className="text-xs text-gray-500 italic">{m.notes}</div>
              )}
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xl space-y-4 border border-gray-700">
            <h2 className="text-lg font-semibold text-white">Agregar comida</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                <input
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  type="date"
                  value={newMeal.date}
                  onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hora</label>
                <input
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  type="time"
                  value={newMeal.time}
                  onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newMeal.type}
                  onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value as MealType })}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Items</label>
                <input
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Items de la comida (ej: tostadas, queso, jugo)"
                  value={newMeal.items}
                  onChange={(e) => setNewMeal({ ...newMeal, items: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Nutrientes</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={newMeal.has_carb}
                      onChange={(e) => setNewMeal({ ...newMeal, has_carb: e.target.checked })}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    🍞 Carbohidratos
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={newMeal.has_protein}
                      onChange={(e) => setNewMeal({ ...newMeal, has_protein: e.target.checked })}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    🥩 Proteína
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={newMeal.has_veggies}
                      onChange={(e) => setNewMeal({ ...newMeal, has_veggies: e.target.checked })}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    🥕 Vegetales
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Notas (opcional)</label>
                <input
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales"
                  value={newMeal.notes}
                  onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                onClick={() => setShowAdd(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors"
                onClick={onCreateMeal}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl space-y-4 border border-gray-700">
            <h2 className="text-lg font-semibold text-white">Importar JSON (bulk)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">JSON de comidas</label>
              <textarea
                className="bg-gray-700 border border-gray-600 rounded w-full h-64 p-3 font-mono text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Pega aquí el JSON con las comidas..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                onClick={() => setBulkOpen(false)}
              >
                Cerrar
              </button>
              <button
                className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700 transition-colors"
                onClick={onBulkImport}
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


