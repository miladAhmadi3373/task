import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js"; // برای مدیریت کوکی‌ها در Next.js

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // یا هر دیتابیس دیگه
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies() // برای تنظیم خودکار کوکی‌ها در سرور اکشن‌ها
  ],
});