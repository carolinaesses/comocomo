"use client";

import { useState } from "react";

export default function TestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Test button clicked");
    console.log("File:", file);

    if (!file) {
      setResult("No file selected");
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      console.log("File content:", text.substring(0, 200));
      setResult(`File loaded successfully! Size: ${text.length} characters\nFirst 200 chars: ${text.substring(0, 200)}`);
    } catch (error) {
      console.error("Error:", error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Página de Prueba</h1>
      <p className="mb-4 text-gray-600">
        Esta página prueba la funcionalidad básica del formulario sin depender de APIs externas.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Seleccionar archivo:
          </label>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => {
              console.log("File input changed:", e.target.files?.[0]);
              setFile(e.target.files?.[0] ?? null);
            }}
            className="block w-full p-2 border border-gray-300 rounded-md"
          />
          {file && (
            <p className="text-sm text-green-600 mt-1">Archivo: {file.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? "Cargando..." : "Probar carga"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <h3 className="font-medium mb-2">Resultado:</h3>
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </main>
  );
}
