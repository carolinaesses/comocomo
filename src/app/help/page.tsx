export default function HelpPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ayuda - ¿Cómo como?</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">🤖 ¿Qué hace esta aplicación?</h2>
          <p className="text-gray-700 mb-4">
            Comocomo utiliza <strong>Inteligencia Artificial (Gemini)</strong> para analizar automáticamente
            archivos de exportación de WhatsApp, detectar mensajes sobre comidas, clasificarlos
            inteligentemente y guardarlos en Google Sheets.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">🚀 Tecnología utilizada:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-3">Gemini AI</span>
                <span>Análisis inteligente de texto y comprensión contextual</span>
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-3">Google Sheets</span>
                <span>Almacenamiento automático de datos estructurados</span>
              </li>
              <li className="flex items-center">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-3">Next.js</span>
                <span>Framework moderno para aplicaciones web</span>
              </li>

            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Cómo exportar un chat de WhatsApp</h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Abre WhatsApp en tu teléfono</li>
              <li>Ve al chat que quieres exportar</li>
              <li>Toca los tres puntos (⋮) en la esquina superior derecha</li>
              <li>Selecciona &quot;Más&quot; → &quot;Exportar chat&quot;</li>
              <li>Elige &quot;Sin archivos multimedia&quot; (importante)</li>
              <li>Guarda el archivo .txt generado</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Formato del archivo</h2>
          <p className="text-gray-700 mb-4">
            El archivo debe tener el formato estándar de exportación de WhatsApp:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`[31/12/24, 08:30:00] Usuario: Mensaje de comida
[31/12/24, 08:32:15] Usuario: Otro mensaje`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">🧠 Qué detecta la IA</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">✅ Se detectan:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Desayuno, almuerzo, comida, cena</li>
                <li>• Snacks, meriendas</li>
                <li>• Comidas específicas: pollo, ensalada, pasta</li>
                <li>• Alimentos: arroz, verduras, frutas, carne</li>
                <li>• Bebidas: café, té, jugo</li>
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">❌ Se ignoran:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Mensajes del sistema</li>
                <li>• Multimedia omitido</li>
                <li>• Cambios en el grupo</li>
                <li>• Mensajes no relacionados con comida</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🎯 Ventajas de usar IA:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Adaptabilidad:</strong> Aprende y se adapta a diferentes estilos de escritura</li>
              <li>• <strong>Contexto:</strong> Entiende el significado detrás de las palabras</li>
              <li>• <strong>Idiomas:</strong> Funciona con español, inglés y otros idiomas</li>
              <li>• <strong>Flexibilidad:</strong> Maneja expresiones informales y formales</li>
              <li>• <strong>Precisión:</strong> Clasifica correctamente tipos de comida y nutrientes</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">🎯 Cómo Funciona el Procesamiento</h2>
          <p className="text-gray-700 mb-4">
            La aplicación utiliza un <strong>prompt optimizado</strong> que instruye a Gemini AI
            para realizar todo el procesamiento de manera completa y eficiente.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🔄 Flujo de Procesamiento</h3>
            <ol className="space-y-3 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">1</span>
                <div>
                  <strong>Lectura Completa:</strong> Gemini lee todo el archivo de WhatsApp
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">2</span>
                <div>
                  <strong>Análisis Inteligente:</strong> Identifica mensajes válidos vs sistema
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">3</span>
                <div>
                  <strong>Detección de Comidas:</strong> Encuentra mensajes relacionados con alimentos
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">4</span>
                <div>
                  <strong>Análisis Nutricional:</strong> Clasifica carbs, proteínas, verduras
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">5</span>
                <div>
                  <strong>Estandarización:</strong> Convierte a formato JSON estructurado
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Ventajas del Sistema</h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li><strong>Procesamiento Completo:</strong> Una sola llamada a Gemini hace todo</li>
              <li><strong>Optimizado:</strong> Prompt diseñado específicamente para WhatsApp</li>
              <li><strong>Eficiente:</strong> Menos tokens, más velocidad</li>
              <li><strong>Consistente:</strong> Resultados predecibles y confiables</li>
              <li><strong>Completo:</strong> Maneja todas las complejidades del formato</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Configuración necesaria</h2>
          <p className="text-gray-700 mb-4">
            Para que la aplicación funcione completamente necesitas configurar:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">API</span>
              <span>Gemini API Key de Google AI Studio</span>
            </li>
            <li className="flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">Sheets</span>
              <span>Google Service Account con acceso a Sheets</span>
            </li>
            <li className="flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">ID</span>
              <span>ID de la hoja de Google Sheets</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Solución de problemas</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800">No se procesan mensajes</h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Verifica que el archivo tenga el formato correcto de WhatsApp</li>
                <li>• Asegúrate de que los mensajes contengan palabras relacionadas con comida</li>
                <li>• Prueba con el archivo <code>sample-chat.txt</code> incluido</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800">Error de configuración</h3>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Copia <code>env-example.txt</code> como <code>.env.local</code></li>
                <li>• Verifica que todas las variables de entorno estén configuradas</li>
                <li>• Asegúrate de que las credenciales de Google sean válidas</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Archivos de ejemplo</h2>
          <p className="text-gray-700 mb-2">
            Puedes usar estos archivos para probar la aplicación:
          </p>
          <ul className="space-y-1">
            <li><code>sample-chat.txt</code> - Archivo de ejemplo con mensajes de comida</li>
            <li><code>env-example.txt</code> - Plantilla de configuración</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
