"use client";

import { useState, useEffect } from "react";

type GeminiMealRecord = {
  userId: string;
  date: string;
  meals: {
    time: string;
    type: string;
    items: string[];
    has_carb: boolean;
    has_protein: boolean;
    has_veggies: boolean;
    notes: string;
  }[];
};

type ApiResponse =
  | { processed: number; appended: number; records: { inputText: string; record: GeminiMealRecord }[]; debug?: any; warning?: string; error?: string }
  | { error: string };

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("onSubmit called");
    console.log("File selected:", file);
    setError(null);
    if (!file) {
      console.log("No file selected, returning early");
      setError("Por favor selecciona un archivo primero");
      return;
    }
    setLoading(true);
    console.log("Starting upload process...");
    try {
      const form = new FormData();
      form.append("file", file);
      console.log("Form data created, making fetch request...");
      const res = await fetch("/api/ingest-txt", {
        method: "POST",
        body: form
      });
      console.log("Fetch response status:", res.status);
      const json = await res.json();
      console.log("Response JSON:", json);

      // Mostrar información detallada sobre el procesamiento con IA
      if (json.processed === 0) {
        console.log("🤖 IA no encontró mensajes de comida en el archivo");
        console.log("📊 Detalles del procesamiento:", json.debug);
      }

      if (!res.ok) throw new Error(json.error || "Upload failed");
      setResult(json);
      console.log("Upload successful");
    } catch (err) {
      console.error("Upload error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
      console.log("Loading set to false");
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Comocomo - Ingesta de WhatsApp .txt</h1>
        <div className="space-y-4">
          <div className="block w-full h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">🤖 Comocomo - IA Completa para WhatsApp</h1>
        <a
          href="/help"
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Ayuda
        </a>
      </div>

      {/* Información de configuración */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">🤖 Procesamiento con IA</h3>
        <p className="text-sm text-blue-700 mb-2">
          Esta aplicación utiliza <strong>Gemini AI como motor completo</strong> para procesar archivos de WhatsApp.
          La IA hace TODO: desde leer los mensajes hasta clasificar nutricionalmente las comidas.
        </p>
        <div className="bg-blue-100 p-3 rounded-md mb-3">
          <h4 className="font-medium text-blue-800 mb-2">🤖 ¿Qué hace la IA?</h4>
          <p className="text-sm text-blue-700 mb-3">
            La IA procesa automáticamente todo el archivo de WhatsApp con un prompt optimizado
            que maneja todas las tareas complejas de análisis y clasificación.
          </p>
          <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
            <li>📖 Lee y analiza archivos completos de WhatsApp</li>
            <li>🔍 Identifica mensajes sobre comidas automáticamente</li>
            <li>🥗 Clasifica componentes nutricionales (carbs, proteínas, verduras)</li>
            <li>📅 Estandariza fechas y horarios (YYYY-MM-DD, HH:MM)</li>
            <li>🎯 Agrupa comidas por usuario y fecha</li>
            <li>🚫 Filtra mensajes irrelevantes del sistema</li>
            <li>⚡ Procesamiento rápido y eficiente</li>
          </ul>
        </div>
        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">Configuración requerida:</h4>
          <p className="text-xs text-yellow-700 mb-2">
            Copia <code className="bg-yellow-100 px-1 rounded">env-example.txt</code> como <code className="bg-yellow-100 px-1 rounded">.env.local</code>
          </p>
          <ul className="text-xs text-yellow-600 list-disc list-inside">
            <li>GEMINI_API_KEY - Para análisis inteligente con IA</li>
            <li>GOOGLE_CLIENT_EMAIL - Email de service account</li>
            <li>GOOGLE_PRIVATE_KEY - Clave privada de service account</li>
            <li>SHEET_ID - ID de tu hoja de Google Sheets</li>
          </ul>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Seleccionar archivo .txt de WhatsApp:
          </label>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => {
              console.log("File input changed:", e.target.files?.[0]);
              setFile(e.target.files?.[0] ?? null);
            }}
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {file && (
            <p className="text-sm text-green-600 mt-1">Archivo seleccionado: {file.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">🤖</span>
              Procesando con IA...
            </span>
          ) : (
            "Subir y procesar con IA"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && "processed" in result && (
        <div className="mt-6">
          {result.processed > 0 && !result.debug?.sheetsError ? (
            // Éxito completo
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🎉</span>
                <h3 className="text-xl font-semibold text-green-800">
                  ¡Procesamiento completado exitosamente!
                </h3>
              </div>

              <div className="bg-green-100 p-4 rounded-md mb-4">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-700">{result.debug?.totalMessages || 0}</div>
                    <div className="text-sm text-green-600">Mensajes analizados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">{result.processed}</div>
                    <div className="text-sm text-green-600">Comidas detectadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">{result.appended}</div>
                    <div className="text-sm text-green-600">Registros guardados</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-green-700">
                <p className="mb-2">
                  <strong>✅ Archivo procesado:</strong> {file?.name}
                </p>
                <p className="mb-2">
                  <strong>🤖 Método usado:</strong> IA Completa
                </p>
                <p>
                  <strong>📊 Estado:</strong> Datos guardados correctamente en Google Sheets
                </p>
              </div>
            </div>
          ) : result.processed > 0 && result.debug?.sheetsError ? (
            // Procesamiento exitoso pero error en Sheets
            <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">⚠️</span>
                <h3 className="text-xl font-semibold text-orange-800">
                  Procesamiento completado con advertencia
                </h3>
              </div>

              <div className="bg-orange-100 p-4 rounded-md mb-4">
                <div className="grid md:grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-700">{result.debug?.totalMessages || 0}</div>
                    <div className="text-sm text-orange-600">Mensajes analizados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-700">{result.processed}</div>
                    <div className="text-sm text-orange-600">Comidas detectadas</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-orange-700">
                <p className="mb-2">
                  <strong>✅ Archivo procesado:</strong> {file?.name}
                </p>
                <p className="mb-2">
                  <strong>🤖 Método usado:</strong> IA Completa
                </p>
                <p className="mb-2">
                  <strong>⚠️ Estado:</strong> {result.warning || "Error al guardar en Google Sheets"}
                </p>
                <p className="text-xs">
                  Los datos se procesaron correctamente pero no se pudieron guardar en la hoja de cálculo.
                  Verifica la configuración de Google Sheets.
                </p>
              </div>
            </div>
          ) : (
            // Sin resultados
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🤔</span>
                <h3 className="text-xl font-semibold text-yellow-800">
                  No se encontraron comidas en el archivo
                </h3>
              </div>

              {result.debug && (
                <div className="bg-yellow-100 p-4 rounded-md mb-4">
                  <div className="grid md:grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-yellow-700">{result.debug.totalMessages}</div>
                      <div className="text-sm text-yellow-600">Mensajes encontrados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-700">{result.debug.foodMessages}</div>
                      <div className="text-sm text-yellow-600">Comidas detectadas</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-yellow-700">
                <p className="mb-2">
                  <strong>📄 Archivo procesado:</strong> {file?.name}
                </p>
                <p className="mb-2">
                  <strong>🤖 Método usado:</strong> IA Completa
                </p>
                {result.debug?.totalMessages === 0 ? (
                  <p className="text-red-600">
                    <strong>⚠️ Problema:</strong> El archivo no parece tener el formato correcto de exportación de WhatsApp
                  </p>
                ) : (
                  <p className="text-orange-600">
                    <strong>⚠️ Problema:</strong> Se encontraron mensajes pero ninguno relacionado con comidas
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
