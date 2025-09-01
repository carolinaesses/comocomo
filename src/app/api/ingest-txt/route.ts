import { NextRequest, NextResponse } from "next/server";
import { parseWhatsAppWithAI } from "@/lib/parser";
import { appendRowsToSheet, SheetRow } from "@/lib/sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("text/plain") && !contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected text/plain or multipart/form-data" }, { status: 400 });
    }

    let text = "";
    if (contentType.includes("text/plain")) {
      text = await req.text();
    } else {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file instanceof File) {
        text = await file.text();
      } else {
        return NextResponse.json({ error: "Missing file field" }, { status: 400 });
      }
    }

    console.log("🤖 Iniciando procesamiento con IA...");
    console.log("📄 Longitud del archivo:", text.length);

    // Usar el parser con IA para todo el procesamiento
    const aiResult = await parseWhatsAppWithAI(text);

    if (!aiResult.success) {
      console.error("❌ Error en procesamiento con IA:", aiResult.error);
      return NextResponse.json({
        processed: 0,
        appended: 0,
        records: [],
        error: aiResult.error || "Error desconocido en procesamiento con IA",
        debug: {
          totalMessages: aiResult.totalMessagesFound,
          foodMessages: aiResult.foodMessagesFound,
          fileLength: text.length,
          aiProcessed: true,
          mode: 'standard'
        }
      });
    }

    console.log("✅ Procesamiento con IA completado exitosamente");
    console.log(`📊 Total de mensajes encontrados: ${aiResult.totalMessagesFound}`);
    console.log(`🍽️ Mensajes de comida procesados: ${aiResult.foodMessagesFound}`);

    // Usar directamente los resultados del parser con IA
    const records = aiResult.messages;

    // Convertir los resultados de IA a filas para Google Sheets
    const rows: SheetRow[] = [];
    for (const record of records) {
      for (const meal of record.meals) {
        rows.push({
          date: record.date,
          time: meal.time,
          type: meal.type,
          items: meal.items.join(", "),
          has_carb: meal.has_carb,
          has_protein: meal.has_protein,
          has_veggies: meal.has_veggies,
          userId: record.userId,
          notes: meal.notes || "",
        });
      }
    }

    console.log(`Intentando guardar ${rows.length} filas en Google Sheets...`);

    try {
      const result = await appendRowsToSheet(rows);
      console.log("Datos guardados exitosamente en Google Sheets:", result);
      return NextResponse.json({
        processed: aiResult.foodMessagesFound,
        appended: result.appended,
        records: aiResult.messages,
        debug: {
          totalMessages: aiResult.totalMessagesFound,
          foodMessages: aiResult.foodMessagesFound,
          fileLength: text.length,
          aiProcessed: true,
          mode: 'standard'
        }
      });
    } catch (error) {
      console.error("Error guardando en Google Sheets:", error);
      // Devolver respuesta parcial indicando que los datos se procesaron pero no se guardaron
      return NextResponse.json({
        processed: aiResult.foodMessagesFound,
        appended: 0,
        records: aiResult.messages,
        warning: "Los datos se procesaron correctamente con IA pero no se pudieron guardar en Google Sheets",
        error: error instanceof Error ? error.message : "Error desconocido en Google Sheets",
        debug: {
          totalMessages: aiResult.totalMessagesFound,
          foodMessages: aiResult.foodMessagesFound,
          fileLength: text.length,
          aiProcessed: true,
          sheetsError: true,
          mode: 'standard'
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


