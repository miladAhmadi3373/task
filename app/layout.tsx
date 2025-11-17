"use client";

import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // usePathname اضافه کردم

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  weight: ["400", "500", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname(); // برای چک تغییر مسیر
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // تابع برای چک کردن cookie
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    const checkLogin = () => {
      const token = getCookie("token");
      setIsLoggedIn(!!token);
      setLoading(false);
    };

    checkLogin(); // چک اولیه

    // listener برای storage events (اگر cookie تغییر کنه، اما cookie مستقیم storage event نداره، اما برای آپدیت کمک می‌کنه)
    const handleStorageChange = () => checkLogin();
    window.addEventListener("storage", handleStorageChange);

    // برای آپدیت فوری بعد از ریدایرکت، یک interval کوچک (هر 500ms چک کن)
    const interval = setInterval(checkLogin, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [pathname]); // وابستگی به pathname: هر بار مسیر تغییر کنه (مثل ریدایرکت بعد از لاگین)، دوباره چک کن

  // تابع خروج: پاک کردن cookie و ریدایرکت
  const handleSignOut = () => {
    document.cookie = "token=; Max-Age=0; path=/; secure; samesite=strict"; // پاک کردن cookie
    setIsLoggedIn(false);
    router.push("/"); // ریدایرکت به صفحه اصلی
  };

  return (
    <html lang="fa" dir="ltr">
      <body className={`${vazir.className} antialiased w-full h-screen`}>
        {/* header */}
        <div className="w-full h-1/12 bg-[#2B8E5D] flex items-center justify-between px-10">
          {/* header left */}
          <div className="flex items-center justify-center">
            <Link href={"/shoppingCart"}>
              <Image
                src={"/cart-image.png"}
                width={50}
                height={50}
                alt=""
                className="cursor-pointer mr-1"
              />
            </Link>
            <p className="w-[0.1px] h-7 bg-white mr-4"></p>
            
            {loading ? (
              <div className="py-1 px-5 text-white">...</div>
            ) : isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="py-1 px-5 flex items-center justify-center ml-1 text-sm border border-white cursor-pointer rounded-lg text-white"
              >
                خروج
              </button>
            ) : (
              <Link href={"login"} className="py-1 px-5 flex items-center justify-center ml-1 text-sm border border-white cursor-pointer rounded-lg text-white">
                ورود | ثبت نام
                <Image
                  src={"/signin.png"}
                  width={28}
                  height={28}
                  alt="signin image"
                />
              </Link>
            )}
            
            <Image
              src={"/notification-image.png"}
              width={40}
              height={40}
              alt="notification image"
              className="ml-2 cursor-pointer"
            />
          </div>
          {/* header right */}
          <div className="text-white text-2xl">MAH</div>
        </div>
        {/* content */}
        <div className="w-full h-11/12 ">{children}</div>
      </body>
    </html>
  );
}