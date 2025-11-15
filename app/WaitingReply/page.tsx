"use client";

import React from "react";
import Link from "next/link";

function WaitingForConfirmation() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-50" dir="rtl">
      <div className="w-[40%] bg-white shadow-xl rounded-2xl p-10 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-4 w-full text-center">در انتظار تایید پرداخت</h1>
        
        {/* Loading Spinner */}
        <div className="relative flex justify-center items-center mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#2B8E5D] border-solid border-opacity-50"></div>
        </div>

        {/* Message */}
        <p className="text-lg text-gray-700 mb-8 text-center">
          رسید پرداخت شما با موفقیت ارسال شد. لطفاً منتظر بمانید تا ادمین پرداخت را تایید کند. این فرآیند ممکن است چند دقیقه طول بکشد.
        </p>

        {/* Additional Info */}
        <div className="w-full mb-8 p-6 bg-gray-100 rounded-xl shadow-inner text-center">
          <p className="text-gray-600">در صورت نیاز، می‌توانید وضعیت سفارش خود را از پنل کاربری پیگیری کنید.</p>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="px-6 py-3 flex items-center justify-center duration-300 hover:shadow-lg cursor-pointer hover:bg-gray-300 bg-gray-200 rounded-xl text-gray-800 font-medium"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

export default WaitingForConfirmation;