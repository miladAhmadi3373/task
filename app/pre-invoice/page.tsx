// app/pre-invoice/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const BASE_URL = process.env.API_BASE_URL || "https://server-1-d5n9.onrender.com/api";

interface CartItem {
  id: number;
  image_src: string;
  title: string;
  desc: string;
  price: number;
  count: number;
}

interface CartData {
  userId: string;
  items: CartItem[];
  total: number;
}

function PreInvoicePage() {
  const router = useRouter();
  const { isAuthorized, loading } = useAuth("user");
  const [shoppingCartItems, setShoppingCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const fetchCart = async (): Promise<void> => {
    try {
      setInvoiceLoading(true);
      setError(null);

      const token = getCookie("token");

      const response = await axios.get(`${BASE_URL}/cart`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = JSON.parse(response.request.response);
      console.log('Cart data received from API:', data);

      if (data && data.items && Array.isArray(data.items)) {
        setShoppingCartItems(data.items);
        setTotalPrice(data.total || 0);
        
        const count = data.items.reduce(
          (acc: number, item: CartItem) => acc + item.count,
          0
        );
        setTotalCount(count);
      } else {
        setError("داده‌های سبد خرید نامعتبر است");
      }

    } catch (error: any) {
      console.error("Error fetching cart:", error);
      setError("خطا در دریافت سبد خرید از سرور");
    } finally {
      setInvoiceLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchCart();

      const now = new Date();
      const formattedDateTime = now.toLocaleString("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setCurrentDateTime(formattedDateTime);
    }
  }, [isAuthorized]);

  const handleRetry = (): void => {
    fetchCart();
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  const handleDownloadInvoice = () => {
    try {
      const invoiceHTML = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Tahoma', 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2B8E5D;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2B8E5D;
              margin: 0;
              font-size: 28px;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .customer-info, .invoice-details {
              flex: 1;
              min-width: 300px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
            }
            th {
              background-color: #2B8E5D;
              color: white;
              padding: 12px;
              text-align: right;
              border: 1px solid #ddd;
            }
            td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: right;
            }
            .total-row {
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 16px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              color: #666;
            }
            .product-info {
              max-width: 200px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
            @media (max-width: 768px) {
              body { padding: 10px; }
              .header h1 { font-size: 22px; }
              .invoice-info { flex-direction: column; }
              .customer-info, .invoice-details { min-width: 100%; }
              table { font-size: 12px; }
              th, td { padding: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>پیش فاکتور فروشگاه</h1>
            <p><strong>تاریخ صدور:</strong> ${currentDateTime}</p>
            <p><strong>شماره فاکتور:</strong> INV-${Date.now().toString().slice(-6)}</p>
          </div>

          <div class="invoice-info">
            <div class="customer-info">
              <h3>مشخصات فروشگاه:</h3>
              <p><strong>نام:</strong> فروشگاه اینترنتی ما</p>
              <p><strong>تلفن:</strong> 021-12345678</p>
              <p><strong>آدرس:</strong> تهران، خیابان نمونه</p>
            </div>
            <div class="invoice-details">
              <h3>مشخصات مشتری:</h3>
              <p><strong>نام:</strong> کاربر گرامی</p>
              <p><strong>نوع خرید:</strong> خرید آنلاین</p>
              <p><strong>تعداد کالا:</strong> ${totalCount} عدد</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="5%">ردیف</th>
                <th width="45%">نام کالا</th>
                <th width="10%">تعداد</th>
                <th width="20%">قیمت واحد</th>
                <th width="20%">جمع</th>
              </tr>
            </thead>
            <tbody>
              ${shoppingCartItems.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="product-info">
                    <strong>${item.title}</strong><br>
                    <small style="color: #666;">${item.desc}</small>
                  </td>
                  <td>${item.count} عدد</td>
                  <td>${item.price.toLocaleString()} تومان</td>
                  <td>${(item.price * item.count).toLocaleString()} تومان</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2">جمع کل فاکتور</td>
                <td>${totalCount} عدد</td>
                <td colspan="2">${totalPrice.toLocaleString()} تومان</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p><strong>با تشکر از اعتماد و خرید شما</strong></p>
            <p>پشتیبانی: 021-12345678 | ایمیل: support@example.com</p>
            <p style="font-size: 12px; color: #999;">
              این سند به صورت خودکار تولید شده است
            </p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
            <button onclick="window.print()" style="background: #2B8E5D; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">
              پرینت پیش فاکتور
            </button>
            <button onclick="window.close()" style="background: #c73d3d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">
              بستن پنجره
            </button>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.focus();
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('خطا در ایجاد پیش فاکتور. لطفاً دوباره تلاش کنید.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <div className="text-xl">در حال بررسی دسترسی...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (invoiceLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <div className="text-xl">در حال بارگذاری پیش فاکتور...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-evenly w-full min-h-screen p-4" dir="rtl">
      {/* Invoice details section */}
      <div className="w-full lg:w-[60%] xl:w-[50%] h-auto my-3 bg-white shadow-lg rounded-2xl p-4 lg:p-6 flex flex-col">
        <h1 className="text-xl lg:text-2xl text-center mb-6 lg:mb-8 text-[#2B8E5D] border-b-2 border-[#2B8E5D] pb-3 lg:pb-4 font-bold">
          پیش فاکتور
        </h1>

        <div className="mb-4 text-right text-base lg:text-lg text-gray-700">
          <p>تاریخ و ساعت صدور: {currentDateTime}</p>
        </div>

        {/* Items table */}
        <div className="bg-gray-50 rounded-xl shadow-inner p-3 lg:p-6 overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 min-w-[600px]">
            <thead>
              <tr className="bg-[#2B8E5D] text-white">
                <th className="p-2 lg:p-3 border border-gray-300 text-xs lg:text-sm">تصویر</th>
                <th className="p-2 lg:p-3 border border-gray-300 text-xs lg:text-sm">عنوان</th>
                <th className="p-2 lg:p-3 border border-gray-300 text-xs lg:text-sm hidden md:table-cell">توضیح</th>
                <th className="p-2 lg:p-3 border border-gray-300 text-xs lg:text-sm">تعداد</th>
                <th className="p-2 lg:p-3 border border-gray-300 text-xs lg:text-sm">قیمت واحد</th>
                <th className="p-2 lg:p-3 border border-gray-300 text-xs lg:text-sm">جمع</th>
              </tr>
            </thead>
            <tbody>
              {shoppingCartItems.map((item: CartItem) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="p-2 lg:p-3 border border-gray-300">
                    <img
                      src={`/${item.image_src}`}
                      alt={item.title}
                      className="w-8 h-8 lg:w-12 lg:h-12 object-cover rounded-md mx-auto"
                    />
                  </td>
                  <td className="p-2 lg:p-3 border border-gray-300 text-gray-800 font-medium text-xs lg:text-sm">
                    {item.title}
                  </td>
                  <td className="p-2 lg:p-3 border border-gray-300 text-gray-600 text-xs hidden md:table-cell">
                    {item.desc}
                  </td>
                  <td className="p-2 lg:p-3 border border-gray-300 text-center text-xs lg:text-sm">
                    {item.count}
                  </td>
                  <td className="p-2 lg:p-3 border border-gray-300 text-right text-xs lg:text-sm">
                    {item.price.toLocaleString()} تومان
                  </td>
                  <td className="p-2 lg:p-3 border border-gray-300 text-right font-medium text-xs lg:text-sm">
                    {(item.price * item.count).toLocaleString()} تومان
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 font-bold">
                <td colSpan={3} className="p-2 lg:p-3 border border-gray-300 text-right text-xs lg:text-sm">
                  تعداد کالا: {totalCount}
                </td>
                <td colSpan={3} className="p-2 lg:p-3 border border-gray-300 text-right text-xs lg:text-sm">
                  جمع کل: {totalPrice.toLocaleString()} تومان
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action buttons section */}
      <div className="w-full lg:w-[35%] xl:w-[30%] h-auto lg:h-[40%] bg-gray-100 shadow-lg rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center mt-5 lg:mt-0">
        <p className="mb-6 lg:mb-8 text-base lg:text-lg text-gray-800 text-center">
          آیا از صحت اطلاعات اطمینان دارید؟
        </p>
        <div className="w-full flex flex-col items-center justify-center mb-4 lg:mb-6 space-y-3 lg:space-y-4">
          <Link
            href={"/payment"}
            className="w-full px-4 lg:px-6 py-3 flex items-center justify-center duration-300 hover:shadow-xl cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-xl text-sm font-medium text-center"
          >
            تایید و ادامه فرایند خرید
          </Link>
          <button 
            onClick={handleDownloadInvoice}
            className="w-full px-4 lg:px-6 py-3 flex items-center justify-center duration-300 hover:shadow-xl cursor-pointer hover:bg-[#5656c4] text-white bg-[#253895] rounded-xl text-sm font-medium"
          >
            دریافت فایل پیش فاکتور
          </button>
        </div>
        <Link
          href={"/shoppingCart"}
          className="text-[#c73d3d] border-b-2 border-[#c73d3d] hover:text-[#da786f] duration-300 cursor-pointer text-sm lg:text-base text-center"
        >
          لغو خرید
        </Link>
      </div>
    </div>
  );
}

export default PreInvoicePage;