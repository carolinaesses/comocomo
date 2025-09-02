import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

interface DebugInfo {
  timestamp: string;
  environment: string | undefined;
  nodeVersion: string;
  database: {
    connected: boolean;
    userCount: number;
    error: string | null;
  };
  bcrypt: {
    working: boolean;
    error: string | null;
  };
  environmentVars: {
    DATABASE_URL: string;
    NODE_ENV: string;
  };
}

export async function GET() {
  const debug: DebugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    database: {
      connected: false,
      userCount: 0,
      error: null
    },
    bcrypt: {
      working: false,
      error: null
    },
    environmentVars: {
      DATABASE_URL: process.env.DATABASE_URL ? "configured" : "missing",
      NODE_ENV: process.env.NODE_ENV || "undefined"
    }
  };

  // Test database connection
  try {
    const userCount = await prisma.user.count();
    debug.database.connected = true;
    debug.database.userCount = userCount;
    console.log("✅ Database connection successful, users:", userCount);
  } catch (dbError) {
    debug.database.error = dbError instanceof Error ? dbError.message : "Unknown DB error";
    console.error("❌ Database connection failed:", dbError);
  }

  // Test bcrypt
  try {
    const testHash = await bcrypt.hash("testpassword", 12);
    const isValid = await bcrypt.compare("testpassword", testHash);
    debug.bcrypt.working = isValid;
    console.log("✅ Bcrypt working correctly");
  } catch (bcryptError) {
    debug.bcrypt.error = bcryptError instanceof Error ? bcryptError.message : "Unknown bcrypt error";
    console.error("❌ Bcrypt test failed:", bcryptError);
  }

  // Only show detailed info in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(debug);
  }

  // In production, only show if there's an error
  const hasErrors = debug.database.error || debug.bcrypt.error || !debug.database.connected || !debug.bcrypt.working;

  if (hasErrors) {
    console.error("❌ Debug endpoint detected issues:", debug);
    return NextResponse.json({
      status: "error",
      message: "Issues detected in production environment",
      timestamp: debug.timestamp,
      database: debug.database.error ? "error" : "ok",
      bcrypt: debug.bcrypt.error ? "error" : "ok"
    });
  }

  return NextResponse.json({
    status: "ok",
    message: "All systems operational",
    timestamp: debug.timestamp
  });
}
