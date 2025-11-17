// app/payment/page.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

function Payment() {
  const router = useRouter();
  const { isAuthorized, loading } = useAuth("user");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://server-1-d5n9.onrender.com/api";

  // Get cookie value by name
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setReceiptFile(file);
        setUploadStatus("✅ رسید با موفقیت انتخاب شد.");
      } else {
        setUploadStatus("❌ لطفاً یک فایل تصویر یا PDF انتخاب کنید.");
        setReceiptFile(null);
      }
    }
  };

  // Read order ID from localStorage
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderId = localStorage.getItem("currentOrderId");
    setCurrentOrderId(orderId);
    
    if (!orderId) {
      setUploadStatus("❌ شناسه سفارش یافت نشد. لطفاً از صفحه پیش فاکتور مجدداً اقدام کنید.");
    }
  }, []);

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiptFile || !currentOrderId) {
      setUploadStatus("❌ لطفاً ابتدا فایل رسید را انتخاب کنید.");
      return;
    }

    try {
      setIsLoading(true);
      setUploadStatus("⏳ در حال آپلود رسید...");

      const token = getCookie("token");
      
      if (!token) {
        setUploadStatus("❌ خطا در احراز هویت. لطفاً مجدداً وارد شوید.");
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("receipt", receiptFile);
      formData.append("orderId", currentOrderId);

      // Debug logs
      console.log("BASE_URL:", BASE_URL);
      console.log("Token exists:", !!token);
      console.log("Order ID:", currentOrderId);
      console.log("File:", receiptFile.name, receiptFile.size);

      const fullUrl = `${BASE_URL}/payment/upload-receipt`;
      console.log("Full URL:", fullUrl);

      const response = await axios.post(fullUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log("Success response:", response.data);
      
      setUploadStatus("✅ رسید با موفقیت آپلود شد!");
      
      // Redirect to next page after success
      setTimeout(() => {
        router.push("/orders");
      }, 2000); // 2 second delay to show success message

    } catch (error: any) {
      console.error("Upload error details:", error);
      
      let errorMessage = "❌ خطا در آپلود رسید";
      if (error.response) {
        // Server error (4xx, 5xx)
        errorMessage = `❌ ${error.response.data?.message || error.response.statusText} (کد: ${error.response.status})`;
      } else if (error.request) {
        // Network or CORS issue
        errorMessage = "❌ مشکل در اتصال به سرور. چک کن CORS یا URL رو.";
      } else {
        errorMessage = `❌ ${error.message}`;
      }
      
      setUploadStatus(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentOrderId");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50">
        <div className="text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center w-full h-full bg-gray-50"
      dir="rtl"
    >
      <div className="w-[40%] h-[95%] bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center">
        {/* Header with Logout */}
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-4 w-full text-center">
            پرداخت کارت به کارت
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 duration-300"
          >
            خروج
          </button>
        </div>

        {/* Card Information */}
        <div className="w-full mb-4 p-3 bg-gray-100 rounded-xl shadow-inner">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            اطلاعات کارت برای انتقال وجه:
          </p>
          <div className="flex flex-col space-y-2 text-gray-700">
            <p className="text-[#166a40] font-bold">
              <span className="font-medium text-gray-700">
                نام دارنده کارت:
              </span>{" "}
              علی احمدی
            </p>
            <p className="text-[#166a40] font-bold">
              <span className="font-medium text-gray-700">شماره کارت:</span>{" "}
              6679-9637-1015-5892
            </p>
            <p className="text-sm text-gray-600 mt-4">
              لطفاً مبلغ کل سفارش را از طریق کارت به کارت (با استفاده از
              اپلیکیشن بانکی یا ATM) به شماره کارت فوق واریز کنید.
            </p>
          </div>
        </div>

        {/* Upload Receipt */}
        <div className="w-full mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            آپلود رسید پرداخت:
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition duration-300"
            disabled={isLoading}
          />
          {uploadStatus && (
            <p
              className={`mt-2 text-sm ${
                uploadStatus.includes("✅") ||
                uploadStatus.includes("🎉") ||
                uploadStatus.includes("موفقیت")
                  ? "text-green-600"
                  : uploadStatus.includes("❌") || uploadStatus.includes("خطا")
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {uploadStatus}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            فایل رسید را به صورت تصویر یا PDF آپلود کنید.
          </p>
          
          {/* Display order ID */}
          {currentOrderId && (
            <p className="text-xs text-gray-400 mt-1">
              شناسه سفارش: {currentOrderId}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col items-center">
          <button
            onClick={handleUploadReceipt}
            disabled={!receiptFile || isLoading}
            className={`w-full h-12 flex items-center justify-center duration-300 cursor-pointer rounded-xl text-white font-medium ${
              receiptFile && !isLoading
                ? "bg-[#2B8E5D] hover:bg-[#4ac085] hover:shadow-lg"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                در حال آپلود...
              </div>
            ) : (
              "تایید پرداخت و ادامه"
            )}
          </button>

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