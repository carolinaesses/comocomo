"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";

export default function Home() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        // User is authenticated, redirect to summary
        router.replace('/summary');
      } else {
        // User is not authenticated, redirect to signin
        router.replace('/signin?redirect=/summary');
      }
    }
  }, [user, userLoading, router]);

  // Show loading while redirecting
  return (
    <main className="p-4 max-w-md mx-auto">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-300">Redirigiendo...</p>
      </div>
    </main>
  );
}
