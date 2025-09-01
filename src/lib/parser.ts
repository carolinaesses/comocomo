import { analyzeFoodMessageWithGemini, GeminiMealRecord } from "./gemini";

export interface WhatsAppMessage {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  user: string;
  text: string;
  raw: string;
}

// FUNCIONES DE PARSER ANTIGUAS ELIMINADAS
// La IA ahora hace TODO el trabajo de parsing

// FUNCIONES AUXILIARES ELIMINADAS
// La IA maneja toda la lógica de identificación de comidas

// TODAS LAS FUNCIONES AUXILIARES ELIMINADAS
// La IA maneja completamente el parsing, extracción y análisis

/**
 * 🤖 IA COMPLETA: Gemini hace TODO el trabajo del parser
 *
 * Esta función delega TODAS las responsabilidades al modelo de IA:
 * ✅ Lectura y análisis del archivo WhatsApp
 * ✅ Identificación de mensajes de comida
 * ✅ Extracción de información (usuario, fecha, hora)
 * ✅ Análisis nutricional detallado (carbs, proteínas, verduras)
 * ✅ Clasificación por tipo de comida (desayuno, almuerzo, etc.)
 * ✅ Estandarización de datos (formatos YYYY-MM-DD, HH:MM)
 * ✅ Filtrado de mensajes irrelevantes
 * ✅ Agrupación inteligente de comidas por usuario/fecha
 *
 * La IA es el "cerebro completo" de la aplicación.
 */
export async function parseWhatsAppWithAI(whatsappText: string): Promise<{
  success: boolean;
  messages: GeminiMealRecord[];
  totalMessagesFound: number;
  foodMessagesFound: number;
  error?: string;
}> {
  try {
    console.log("🚀 🤖 Iniciando procesamiento con IA...");
    console.log("📄 Archivo recibido:", whatsappText.length, "caracteres");

    // Crear prompt completo con instrucciones detalladas
    const prompt = createWhatsAppParsingPrompt(whatsappText);

    console.log("🎯 Enviando a Gemini para análisis completo...");
    const analysisResult = await analyzeWithGemini(prompt);

    if (!analysisResult.success) {
      return {
        success: false,
        messages: [],
        totalMessagesFound: 0,
        foodMessagesFound: 0,
        error: analysisResult.error
      };
    }

    console.log("✅ 🤖 Procesamiento completado exitosamente");
    console.log("📊 Resultados:", {
      mensajesAnalizados: analysisResult.totalMessagesFound,
      comidasEncontradas: analysisResult.foodMessagesFound,
      usuarios: analysisResult.messages.length
    });

    return {
      success: true,
      messages: analysisResult.messages,
      totalMessagesFound: analysisResult.totalMessagesFound,
      foodMessagesFound: analysisResult.foodMessagesFound
    };

  } catch (error) {
    console.error("❌ Error en parsing con IA:", error);
    return {
      success: false,
      messages: [],
      totalMessagesFound: 0,
      foodMessagesFound: 0,
      error: error instanceof Error ? error.message : "Error desconocido en parsing con IA"
    };
  }
}



/**
 * Crea el prompt completo para que Gemini haga TODO el trabajo del parser
 */
function createWhatsAppParsingPrompt(whatsappText: string): string {
  // Limitar el texto si es muy largo para no exceder límites de tokens
  const maxLength = 80000; // Aumentar límite para archivos más grandes
  const truncatedText = whatsappText.length > maxLength
    ? whatsappText.substring(0, maxLength) + "\n\n[TEXTO TRUNCADO - ARCHIVO MUY LARGO]"
    : whatsappText;

  const instructions = `ERES UN ANALIZADOR DE MENSAJES DE WHATSAPP ESPECIALIZADO EN NUTRICIÓN.

TRABAJO COMPLETO QUE DEBES REALIZAR:

1. 📖 LECTURA Y ANÁLISIS DEL ARCHIVO:
   - Lee todo el contenido del archivo de WhatsApp
   - Identifica el formato de mensajes (corchetes, timestamps, usuarios)
   - Separa mensajes válidos de mensajes del sistema

2. 🔍 IDENTIFICACIÓN DE MENSAJES DE COMIDA:
   - Busca TODOS los mensajes que mencionen alimentos, comidas o bebidas
   - Detecta expresiones informales: "comí", "desayuné", "almorcé", etc.
   - Incluye menciones a productos: "pan", "leche", "carne", etc.
   - Considera contextos nutricionales implícitos

3. 📊 EXTRACCIÓN DE INFORMACIÓN:
   - Extrae usuario, fecha y hora de cada mensaje
   - Identifica el contenido relacionado con comida
   - Agrupa comidas relacionadas del mismo usuario en la misma fecha

4. 🥗 ANÁLISIS NUTRICIONAL DETALLADO:
   - CARBOHIDRATOS: pan, pasta, arroz, cereales, papas, azúcar, frutas
   - PROTEÍNAS: carne, pollo, pescado, huevos, queso, leche, legumbres, tofu
   - VERDURAS: lechuga, tomate, zanahoria, espinaca, brócoli, etc.
   - BEBIDAS: café, té, jugos, agua, refrescos (clasificar nutricionalmente)

5. 📅 CLASIFICACIÓN POR TIPO DE COMIDA:
   - BREAKFAST: 6:00-11:00 (desayuno, desayuno, almuerzo temprano)
   - LUNCH: 11:00-16:00 (almuerzo, comida, lunch)
   - DINNER: 16:00-22:00 (cena, dinner)
   - SNACK: otras horas (snack, merienda, tentempié)

6. 🗓️ ESTANDARIZACIÓN DE DATOS:
   - Fechas: formato YYYY-MM-DD
   - Horas: formato HH:MM (24 horas)
   - Usuarios: nombres limpios sin caracteres especiales
   - Items: lista de alimentos específicos mencionados

7. 🚫 FILTROS DE EXCLUSIÓN:
   - Mensajes del sistema: "se unió", "cambió el asunto"
   - Multimedia: "multimedia omitido", "imagen omitida"
   - Notificaciones: "mensajes y llamadas", "cambió a"
   - Mensajes vacíos o irrelevantes`;

  return `${instructions}

FORMATO DE SALIDA (JSON estricto - EJEMPLO COMPLETO):
{
  "totalMessagesFound": 15,
  "foodMessagesFound": 8,
  "meals": [
    {
      "userId": "Juan Pérez",
      "date": "2024-12-31",
      "meals": [
        {
          "time": "08:30",
          "type": "breakfast",
          "items": ["tostadas integrales", "jamón", "queso", "café negro"],
          "has_carb": true,
          "has_protein": true,
          "has_veggies": false,
          "notes": "desayuno completo con cafeína"
        },
        {
          "time": "13:15",
          "type": "lunch",
          "items": ["pollo grill", "arroz blanco", "ensalada mixta", "agua"],
          "has_carb": true,
          "has_protein": true,
          "has_veggies": true,
          "notes": "comida balanceada con proteína magra"
        }
      ]
    },
    {
      "userId": "María García",
      "date": "2024-12-31",
      "meals": [
        {
          "time": "09:00",
          "type": "breakfast",
          "items": ["cereal de avena", "leche", "plátano", "yogur natural"],
          "has_carb": true,
          "has_protein": true,
          "has_veggies": false,
          "notes": "desayuno saludable con frutas"
        }
      ]
    }
  ]
}

INSTRUCCIONES DE SALIDA CRÍTICAS:
- Devuelve ÚNICAMENTE el JSON válido, sin NINGUNA explicación adicional
- NO incluyas \`\`\`json, \`\`\`, o marcadores de código
- NO incluyas frases como "Aquí está:", "Resultado:", "JSON:", etc.
- El JSON debe comenzar con { y terminar con }
- Usa comillas dobles (") para todas las strings
- Si no encuentras comidas, devuelve: {"totalMessagesFound": 0, "foodMessagesFound": 0, "meals": []}

ARCHIVO DE WHATSAPP A ANALIZAR:
${truncatedText}`;
}

/**
 * Función auxiliar para analizar con Gemini usando el prompt específico
 */
async function analyzeWithGemini(prompt: string): Promise<{
  success: boolean;
  messages: GeminiMealRecord[];
  totalMessagesFound: number;
  foodMessagesFound: number;
  error?: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY env var");
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      },
    ],
    generationConfig: {
      temperature: 0.0, // Temperatura 0 para máxima consistencia
      topP: 1.0,
      maxOutputTokens: 8192,
      responseMimeType: "application/json", // Especificar que queremos JSON
    },
  };

  const res = await fetch(`${url}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const textOut = extractTextFromGeminiResponse(data);

  try {
    // Limpiar la respuesta de Gemini
    let cleanJson = textOut.trim();

    // Remover posibles marcadores de código
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');

    // Remover posibles prefijos como "Aquí está:" o "Resultado:"
    cleanJson = cleanJson.replace(/^(Aquí está|Resultado|Respuesta|JSON)[:.]?\s*/i, '');

    // Encontrar el JSON real (buscar el primer { y el último })
    const startIndex = cleanJson.indexOf('{');
    const lastIndex = cleanJson.lastIndexOf('}');

    if (startIndex === -1 || lastIndex === -1 || startIndex >= lastIndex) {
      throw new Error("No se pudo encontrar JSON válido en la respuesta");
    }

    cleanJson = cleanJson.substring(startIndex, lastIndex + 1);

    console.log("JSON limpio a parsear:", cleanJson.substring(0, 200) + "...");

    let parsed = JSON.parse(cleanJson);

    // Validar la estructura de respuesta
    if (!parsed || typeof parsed !== 'object') {
      throw new Error("Respuesta parseada no es un objeto válido");
    }

    if (!parsed.meals || !Array.isArray(parsed.meals)) {
      console.warn("Estructura de respuesta no estándar, intentando adaptar...");

      // Intentar adaptar respuestas con estructura diferente
      if (parsed.data && Array.isArray(parsed.data)) {
        parsed.meals = parsed.data;
      } else if (parsed.results && Array.isArray(parsed.results)) {
        parsed.meals = parsed.results;
      } else if (Array.isArray(parsed)) {
        // Si es un array directo, asumirlo como meals
        parsed = { meals: parsed, totalMessagesFound: parsed.length, foodMessagesFound: parsed.length };
      } else {
        throw new Error("No se pudo encontrar estructura de meals en la respuesta");
      }
    }

    return {
      success: true,
      messages: parsed.meals,
      totalMessagesFound: parsed.totalMessagesFound || parsed.meals.length,
      foodMessagesFound: parsed.foodMessagesFound || parsed.meals.length
    };

  } catch (parseError) {
    console.error("Error parseando respuesta de Gemini:", parseError);
    console.error("Respuesta original:", textOut.substring(0, 500));

    // Intentar extraer JSON usando expresiones regulares como último recurso
    try {
      const jsonMatch = textOut.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const fallbackJson = JSON.parse(jsonMatch[0]);
        console.log("JSON extraído con regex como fallback");
        return {
          success: true,
          messages: fallbackJson.meals || [],
          totalMessagesFound: fallbackJson.totalMessagesFound || 0,
          foodMessagesFound: fallbackJson.foodMessagesFound || 0
        };
      }
    } catch (fallbackError) {
      console.error("Fallback también falló:", fallbackError);
    }

    throw new Error(`La respuesta de Gemini no es JSON válido: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
  }
}

/**
 * Extrae el texto de la respuesta de Gemini
 */
function extractTextFromGeminiResponse(data: any): string {
  const candidates = data.candidates;
  const partText = candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof partText === "string" && partText.trim()) return partText.trim();

  const parts = candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("");
    if (joined.trim()) return joined.trim();
  }

  throw new Error("Gemini response missing text");
}


