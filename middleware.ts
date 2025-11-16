// middleware.ts (یا middleware.js)

import { NextRequest, NextResponse } from "next/server";
// import { getSessionCookie } from "better-auth/cookies"; // این رو کامنت کن یا حذف کن اگر از better-auth استفاده نمی‌کنی
// import { authClient } from "./lib/auth-client"; // این هم اگر لازم نیست، حذف کن

export async function middleware(request: NextRequest) {
  // تابع ساده برای چک کردن cookie
  const getCookie = (name: string) => {
    const cookie = request.cookies.get(name)?.value || null;
    return cookie;
  };

  const token = getCookie("token"); // چک cookie "token" که در لاگین/ثبت‌نام ست می‌کنی

  if (!token && request.nextUrl.pathname.startsWith("/shoppingCart")) {
    return NextResponse.redirect(new URL("/login", request.url)); // به /login ریدایرکت کن، نه /register
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/shoppingCart/:path*"], // حفاظت از همه زیرمسیرهای /shoppingCart
};