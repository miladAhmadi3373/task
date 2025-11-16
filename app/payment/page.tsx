"use client";

import Link from "next/link";
import React, { useState } from "react";

function Payment() {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setReceiptFile(file);
        setUploadStatus("رسید با موفقیت انتخاب شد.");
      } else {
        setUploadStatus("لطفاً یک فایل تصویر یا PDF انتخاب کنید.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-50" dir="rtl">
      <div className="w-[40%] h-[95%] bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 border-b-2 border-gray-300 pb-4 w-full text-center">پرداخت کارت به کارت</h1>
        
        {/* Card Information */}
        <div className="w-full mb-4 p-3 bg-gray-100 rounded-xl shadow-inner">
          <p className="text-lg font-semibold text-gray-800 mb-2">اطلاعات کارت برای انتقال وجه:</p>
          <div className="flex flex-col space-y-2 text-gray-700">
            <p className="text-[#166a40] font-bold"><span className="font-medium text-gray-700">نام دارنده کارت:</span> علی احمدی</p>
            <p className="text-[#166a40] font-bold"><span className="font-medium text-gray-700">شماره کارت:</span> 6679-9637-1015-5892 </p>
            <p className="text-sm text-gray-600 mt-4">لطفاً مبلغ کل سفارش را از طریق کارت به کارت (با استفاده از اپلیکیشن بانکی یا ATM) به شماره کارت فوق واریز کنید.</p>
          </div>
        </div>

        {/* Upload Receipt */}
        <div className="w-full mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">آپلود رسید پرداخت:</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition duration-300"
          />
          {uploadStatus && <p className="mt-2 text-sm text-gray-600">{uploadStatus}</p>}
          <p className="text-sm text-gray-500 mt-2">فایل رسید را به صورت تصویر یا PDF آپلود کنید.</p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col items-center">
          <Link
            href="/WaitingReply"
            className={`w-full h-12 flex items-center justify-center duration-300 cursor-pointer rounded-xl text-white font-medium ${
              receiptFile ? "bg-[#2B8E5D] hover:bg-[#4ac085] hover:shadow-lg" : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => !receiptFile && e.preventDefault()}
          >
            تایید پرداخت و ادامه
          </Link>
          <Link
            href="/pre-invoice"
            className="mt-4 text-gray-600 hover:text-gray-800 duration-300 border-b border-gray-600"
          >
            بازگشت به پیش فاکتور
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Payment;