import { NextRequest, NextResponse } from "next/server";
import { parseWhatsAppWithAI } from "@/lib/parser";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("text/plain") && !contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected text/plain or multipart/form-data" }, { status: 400 });
    }

    // Obtener el userId del usuario autenticado desde las cookies
    const getCookie = (name: string) => {
      const value = `; ${req.headers.get('cookie') || ''}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const userCookie = getCookie("comocomo-user");
    if (!userCookie) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
    }

    let authenticatedUserId: string;
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie));
      authenticatedUserId = userData.id;
    } catch (error) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    console.log("👤 Usuario autenticado:", authenticatedUserId);

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

    console.log("📊 Registros de IA procesados:", records.length);
    console.log("👤 UserIds encontrados en IA:", records.map(r => r.userId));

    // Preparar los datos para guardar en la base de datos
    // Usar el userId del usuario autenticado, NO el de la IA
    const mealsToCreate = [];
    for (const record of records) {
      for (const meal of record.meals) {
        // Convertir fecha de string a DateTime
        const dateObj = new Date(record.date + 'T00:00:00Z'); // Asumir que la fecha está en formato YYYY-MM-DD

        mealsToCreate.push({
          userId: authenticatedUserId, // Usar el usuario autenticado, NO record.userId
          date: dateObj,
          time: meal.time,
          type: meal.type,
          items: Array.isArray(meal.items) ? meal.items.join(", ") : meal.items,
          has_carb: meal.has_carb,
          has_protein: meal.has_protein,
          has_veggies: meal.has_veggies,
          notes: meal.notes || null,
        });
      }
    }

    console.log("✅ Preparando comidas para usuario:", authenticatedUserId);
    console.log("🍽️ Total de comidas a guardar:", mealsToCreate.length);

    console.log(`Intentando guardar ${mealsToCreate.length} comidas en la base de datos...`);

    try {
      // Crear las comidas en la base de datos usando Prisma
      const createdMeals = await prisma.meal.createMany({
        data: mealsToCreate,
        skipDuplicates: true, // Evitar duplicados según la restricción única
      });

      console.log("✅ Datos guardados exitosamente en la base de datos:", {
        attempted: mealsToCreate.length,
        created: createdMeals.count
      });

      return NextResponse.json({
        processed: aiResult.foodMessagesFound,
        appended: createdMeals.count,
        records: aiResult.messages,
        debug: {
          totalMessages: aiResult.totalMessagesFound,
          foodMessages: aiResult.foodMessagesFound,
          fileLength: text.length,
          aiProcessed: true,
          mode: 'database'
        }
      });
    } catch (error) {
      console.error("❌ Error guardando en la base de datos:", error);

      // Devolver respuesta parcial indicando que los datos se procesaron pero no se guardaron
      return NextResponse.json({
        processed: aiResult.foodMessagesFound,
        appended: 0,
        records: aiResult.messages,
        warning: "Los datos se procesaron correctamente con IA pero no se pudieron guardar en la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido en la base de datos",
        debug: {
          totalMessages: aiResult.totalMessagesFound,
          foodMessages: aiResult.foodMessagesFound,
          fileLength: text.length,
          aiProcessed: true,
          dbError: true,
          mode: 'database'
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


