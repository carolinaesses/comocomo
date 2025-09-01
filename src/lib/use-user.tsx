"use client";

import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const userCookie = getCookie("comocomo-user");
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userCookie));
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        document.cookie = "comocomo-user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        // Set cookie that expires in 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `comocomo-user=${encodeURIComponent(JSON.stringify(data.user))}; expires=${expires}; path=/`;
      } else {
        throw new Error(data.error || 'Error en login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        // Set cookie that expires in 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `comocomo-user=${encodeURIComponent(JSON.stringify(data.user))}; expires=${expires}; path=/`;
      } else {
        throw new Error(data.error || 'Error en registro');
      }
    } catch (error) {
      console.error('Error en signup:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear the cookie
    document.cookie = "comocomo-user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  return {
    user,
    userId: user?.id,
    loading,
    login,
    signup,
    logout,
  };
}
