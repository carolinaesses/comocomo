import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  let email = ''; // Declarar email en el scope exterior para el catch
  try {
    const body = await req.json();
    const { email: emailFromBody, password } = body;
    email = emailFromBody;

    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailFromBody)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // Validación de longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    console.log("📧 Procesando registro para:", emailFromBody);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailFromBody }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // Hashear la contraseña
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
      console.log("🔐 Contraseña hasheada correctamente");
    } catch (hashError) {
      console.error("❌ Error hasheando contraseña:", hashError);
      return NextResponse.json(
        { error: "Error procesando contraseña" },
        { status: 500 }
      );
    }

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email: emailFromBody,
        password: hashedPassword,
        name: emailFromBody.split('@')[0], // Usar parte del email como nombre
      }
    });

    console.log("👤 Usuario creado exitosamente:", newUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }
    });

  } catch (error) {
    console.error("❌ Error creando usuario:", error);

    // En desarrollo, mostrar más detalles del error
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          error: "Error interno del servidor",
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }

    // En producción, log detallado pero respuesta genérica
    console.error("❌ Detalles del error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email: email ? 'provided' : 'missing',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
