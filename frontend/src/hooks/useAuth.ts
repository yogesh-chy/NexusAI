"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken, isAuthenticated as checkAuth } from "@/lib/auth";

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      const isAuth = checkAuth();
      if (requireAuth && !isAuth) {
        router.push("/login");
      } else if (!requireAuth && isAuth) {
        router.push("/dashboard");
      }
      setLoading(false);
    };

    check();
  }, [requireAuth, router]);

  const logout = () => {
    removeToken();
    router.push("/login");
  };

  return { loading, logout };
}
