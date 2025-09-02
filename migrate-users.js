const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrateExistingUsers() {
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
    const defaultPassword = 'temppassword123'; // Contraseña temporal para usuarios migrados
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    for (const userId of allUserIds) {
      if (!existingUserIds.has(userId)) {
        usersToCreate.push({
          id: userId,
          email: `user-${userId}@migrated.local`, // Email temporal
          password: hashedPassword,
          name: `Usuario ${userId}`,
        });
      }
    }

    if (usersToCreate.length > 0) {
      console.log(`👤 Creando ${usersToCreate.length} usuarios...`);
      console.log(`🔑 Usando contraseña temporal: ${defaultPassword}`);
      console.log("⚠️ IMPORTANTE: Los usuarios migrados deben cambiar su contraseña después del primer login");
      await prisma.user.createMany({
        data: usersToCreate
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
      error: error.message || "Error desconocido"
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function runMigration() {
  console.log("🚀 Ejecutando migración de usuarios...");
  const result = await migrateExistingUsers();

  if (result.success) {
    console.log("✅ Migración completada exitosamente");
    console.log(`📊 Total de userId encontrados: ${result.totalUserIds}`);
    console.log(`👤 Usuarios creados: ${result.usersCreated}`);
  } else {
    console.error("❌ Error en migración:", result.error);
  }

  process.exit(0);
}

runMigration().catch(console.error);
