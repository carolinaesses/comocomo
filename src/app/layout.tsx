import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { AuthHeader } from "@/components/AuthHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Comocomo",
  description: "Seguimiento nutricional inteligente con IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900 text-white`} suppressHydrationWarning={true}>
        <div className="min-h-screen flex flex-col">
            {/* Header - Mobile First */}
            <header className="bg-gray-800 shadow-sm border-b border-gray-700 px-4 py-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <Link href="/summary" className="text-lg font-bold text-white">
                  🍽️ Comocomo
                </Link>
                <AuthHeader />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-20 px-2 bg-gray-900">
              {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-10">
              <div className="flex items-center justify-around py-3 px-1 max-w-md mx-auto">
                <Link
                  href="/meals"
                  className="flex flex-col items-center justify-center py-1 px-2 text-xs rounded-lg transition-colors hover:bg-gray-700 active:bg-gray-600 min-w-0 flex-1 text-gray-300"
                >
                  <span className="text-base mb-1">🍽️</span>
                  <span className="font-medium text-xs">Comidas</span>
                </Link>

                <Link
                  href="/summary"
                  className="flex flex-col items-center justify-center py-1 px-2 text-xs rounded-lg transition-colors hover:bg-gray-700 active:bg-gray-600 min-w-0 flex-1 text-gray-300"
                >
                  <span className="text-base mb-1">📊</span>
                  <span className="font-medium text-xs">Estadísticas</span>
                </Link>

                <Link
                  href="/diet"
                  className="flex flex-col items-center justify-center py-1 px-2 text-xs rounded-lg transition-colors hover:bg-gray-700 active:bg-gray-600 min-w-0 flex-1 text-gray-300"
                >
                  <span className="text-base mb-1">🎯</span>
                  <span className="font-medium text-xs">Plan</span>
                </Link>

                <Link
                  href="/calendar"
                  className="flex flex-col items-center justify-center py-1 px-2 text-xs rounded-lg transition-colors hover:bg-gray-700 active:bg-gray-600 min-w-0 flex-1 text-gray-300"
                >
                  <span className="text-base mb-1">📅</span>
                  <span className="font-medium text-xs">Calendario</span>
                </Link>
                          </div>
          </nav>
        </div>
      </body>
    </html>
  );
}

