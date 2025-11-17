// hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requiredRole: string | null = null) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  useEffect(() => {
    const token = getCookie("token");
    const storedRole = localStorage.getItem("userRole");

    console.log("🔐 بررسی دسترسی:");
    console.log("توکن:", token ? "وجود دارد" : "وجود ندارد");
    console.log("نقش ذخیره شده:", storedRole);
    console.log("نقش مورد نیاز:", requiredRole);

    if (!token) {
      console.log("❌ توکن وجود ندارد، هدایت به لاگین");
      router.push("/login");
      return;
    }

    // اگر توکن ادمین است
    if (token.startsWith("admin-token-")) {
      if (requiredRole === "admin") {
        console.log("✅ ادمین مجاز است");
        setIsAuthorized(true);
      } else {
        console.log("❌ ادمین به صفحه کاربر دسترسی ندارد، هدایت به پنل ادمین");
        router.push("/paneladmin");
      }
    } 
    // اگر کاربر عادی است
    else {
      if (requiredRole === "user") {
        console.log("✅ کاربر عادی مجاز است");
        setIsAuthorized(true);
      } else {
        console.log("❌ کاربر عادی به صفحه ادمین دسترسی ندارد، هدایت به سبد خرید");
        router.push("/shoppingCart");
      }
    }

    setLoading(false);
  }, [router, requiredRole]);

  return { isAuthorized, loading };
}