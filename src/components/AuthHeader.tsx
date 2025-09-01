"use client";

import { useUser } from "@/lib/use-user";

export function AuthHeader() {
  const { user, logout } = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm text-gray-300 px-3 py-1">
        {user.email || user.id}
      </div>
      <button
        onClick={logout}
        className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
