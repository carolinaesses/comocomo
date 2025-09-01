import { prisma } from "./db";

export async function migrateExistingUsers() {
  console.log("🚀 Iniciando migración de usuarios existentes...");

  try {
    // Obtener todos los userId únicos de las tablas existentes
    const mealUserIds = await prisma.meal.findMany({
      select: { userId: true },
      distinct: ['userId']
    });

    const idealDietUserIds = await prisma.idealDiet.findMany({
      select: { userId: true },
      distinct: ['userId']
    });

    const dailyScoreUserIds = await prisma.dailyScore.findMany({
      select: { userId: true },
      distinct: ['userId']
    });

    // Combinar todos los userId únicos
    const allUserIds = new Set([
      ...mealUserIds.map(m => m.userId),
      ...idealDietUserIds.map(i => i.userId),
      ...dailyScoreUserIds.map(d => d.userId)
    ]);

    console.log(`📊 Encontrados ${allUserIds.size} userId únicos en las tablas existentes`);

    // Verificar cuáles usuarios ya existen
    const existingUsers = await prisma.user.findMany({
      select: { id: true }
    });

    const existingUserIds = new Set(existingUsers.map(u => u.id));

    // Crear usuarios para los userId que no existen
    const usersToCreate = [];
    for (const userId of allUserIds) {
      if (!existingUserIds.has(userId)) {
        usersToCreate.push({
          id: userId,
          email: `user-${userId}@migrated.local`, // Email temporal
          name: `Usuario ${userId}`,
        });
      }
    }

    if (usersToCreate.length > 0) {
      console.log(`👤 Creando ${usersToCreate.length} usuarios...`);
      await prisma.user.createMany({
        data: usersToCreate,
        skipDuplicates: true
      });
      console.log("✅ Usuarios creados exitosamente");
    } else {
      console.log("ℹ️ Todos los usuarios ya existen");
    }

    return {
      success: true,
      totalUserIds: allUserIds.size,
      usersCreated: usersToCreate.length
    };

  } catch (error) {
    console.error("❌ Error en migración de usuarios:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}
