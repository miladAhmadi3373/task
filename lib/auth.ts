// lib/auth.ts
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: memoryAdapter,
  secret: process.env.AUTH_SECRET || "fallback-secret-change-in-production",
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 روز
    updateAge: 60 * 60 * 24, // هر 24 ساعت آپدیت شود
  },
  cookies: nextCookies,
  trustHost: true,
  basePath: "/api/auth",
});

// انواع TypeScript صحیح برای better-auth
export type Session = ReturnType<typeof auth.api.getSession> extends Promise<infer T> 
  ? T 
  : never;

export type User = Session extends { user: infer U } 
  ? U 
  : never;