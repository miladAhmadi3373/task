"use client";

import Link from "next/link";
import React from "react";

function LoginPrompt() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200" dir="rtl">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-6 md:p-12 flex flex-col items-center transform transition-all duration-500 hover:scale-105">
        <div className="mb-6 md:mb-8">
          <svg className="w-12 h-12 md:w-16 md:h-16 text-[#2B8E5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3-2 5-2 5s-2-2-2-5a4 4 0 018 0c0 3-2 5-2 5m-4 0v2m0 4h.01M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 md:mb-6 border-b-2 border-[#2B8E5D] pb-3 md:pb-4 w-full text-center tracking-wide">دسترسی به سبد خرید</h1>
        
        {/* Message Section */}
        <p className="text-base md:text-xl text-gray-700 mb-8 md:mb-10 text-center leading-relaxed">
          برای مشاهده و مدیریت سبد خرید خود، لطفاً ابتدا وارد حساب کاربری شوید. اگر حساب ندارید، می‌توانید ثبت‌نام کنید.
        </p>

        {/* Login Button */}
        <Link
          href="/login"
          className="px-6 py-3 md:px-10 md:py-4 flex items-center justify-center duration-300 hover:shadow-2xl cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-full text-base md:text-lg font-semibold tracking-wide transform hover:-translate-y-1 w-full"
        >
          ورود به حساب کاربری
        </Link>

        {/* Register Link */}
        <p className="mt-4 md:mt-6 text-gray-600 text-center text-sm md:text-base">
          حساب کاربری ندارید؟{' '}
          <Link href="/register" className="text-[#2B8E5D] hover:text-[#4ac085] font-medium duration-300">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPrompt;