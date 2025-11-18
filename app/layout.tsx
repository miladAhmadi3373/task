"use client";

import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to get cookie by name
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

    checkLogin(); // Initial check

    // Listener for storage events to handle updates
    const handleStorageChange = () => checkLogin();
    window.addEventListener("storage", handleStorageChange);

    // Interval for periodic checks
    const interval = setInterval(checkLogin, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [pathname]); // Re-check on pathname change

  // Handle sign out: clear cookie and redirect
  const handleSignOut = () => {
    document.cookie = "token=; Max-Age=0; path=/; secure; samesite=strict";
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <html lang="fa" dir="ltr">
      <body className={`${vazir.className} antialiased w-full h-screen`}>
        {/* Header */}
        <div className="w-full h-[8vh] md:h-[8.33vh] bg-[#2B8E5D] flex items-center justify-between px-4 md:px-10">
          {/* Header left section */}
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            <Link href={"/shoppingCart"}>
              <Image
                src={"/cart-image.png"}
                width={40}
                height={40}
                alt=""
                className="cursor-pointer"
              />
            </Link>
            <div className="w-[1px] h-6 bg-white"></div>
            
            {loading ? (
              <div className="py-1 px-3 md:px-5 text-white text-sm md:text-base">...</div>
            ) : isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="py-1 px-3 md:px-5 flex items-center justify-center text-sm md:text-base border border-white cursor-pointer rounded-lg text-white"
              >
                خروج
              </button>
            ) : (
              <Link href={"login"} className="py-1 px-3 md:px-5 flex items-center justify-center text-sm md:text-base border border-white cursor-pointer rounded-lg text-white">
                ورود | ثبت نام
                <Image
                  src={"/signin.png"}
                  width={24}
                  height={24}
                  alt="signin image"
                  className="ml-1 md:ml-2"
                />
              </Link>
            )}
            
            <Image
              src={"/notification-image.png"}
              width={32}
              height={32}
              alt="notification image"
              className="cursor-pointer"
            />
          </div>
          {/* Header right section */}
          <div className="text-white text-xl md:text-2xl">MAH</div>
        </div>
        {/* Content */}
        <div className="w-full h-[92vh] md:h-[91.67vh]">{children}</div>
      </body>
    </html>
  );
}