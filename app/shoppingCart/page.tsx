"use client";

import Image from "next/image";
import Cart from "@/components/cart";
import "../globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
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

export default function CartPage() {
  const router = useRouter();
  const { isAuthorized, loading } = useAuth("user");
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [cartLoading, setCartLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get cookie by name
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Fetch cart data from server
  const fetchCart = async (): Promise<void> => {
    try {
      setCartLoading(true);
      setError(null);

      const token = getCookie("token");

      const response = await axios.get(`${BASE_URL}/cart`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = JSON.parse(response.request.response);
      console.log('Cart data received:', data);
      
      setCartData(data);
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      setError("خطا در دریافت سبد خرید از سرور");
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchCart();
    }
  }, [isAuthorized]);

  const totalPrice: number = cartData?.total || 0;
  const totalCount: number =
    cartData?.items?.reduce(
      (acc: number, item: CartItem) => acc + item.count,
      0
    ) || 0;

  // Handle pre-invoice click: store cart data in localStorage
  const handlePreInvoiceClick = (): void => {
    if (cartData) {
      localStorage.setItem("shoppingCartItems", JSON.stringify(cartData));
    }
  };

  // Handle retry fetch
  const handleRetry = (): void => {
    fetchCart();
  };

  // Handle logout: clear cookie and redirect
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen text-base md:text-lg">
        در حال بررسی ورود...
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen p-3 sm:p-4 lg:p-6 bg-gray-50">
      {/* Shopping cart content */}
      <div className="w-full max-w-6xl rounded-2xl bg-gray-100 flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-6 min-h-[500px]">
        
        {/* Left sidebar - Cart summary */}
        <div className="w-full lg:w-1/3 bg-green-50 shadow-lg h-auto lg:h-auto m-2 sm:m-3 lg:m-4 rounded-xl flex flex-col order-2 lg:order-1">
          <div className="text-center w-full mt-4 sm:mt-6 lg:mt-8 text-lg sm:text-xl font-bold text-[#2B8E5D]">
            سبد نهایی
          </div>
          
          <div className="flex flex-col justify-between pb-6 lg:pb-8 w-full h-full px-3 sm:px-4">
            {/* Cart Summary */}
            <div className="flex-1">
              <div className="bg-green-100 py-3 sm:py-4 rounded-xl mt-4 sm:mt-6 border border-green-200">
                <div className="flex items-center justify-between w-full px-3 sm:px-4 text-sm sm:text-base">
                  <p className="font-bold text-[#2B8E5D]">{`(${totalCount})`}</p>
                  <p className="text-gray-700">تعداد کالا</p>
                </div>
                
                {/* Cart Items List */}
                <div className="max-h-32 sm:max-h-40 overflow-y-auto mt-3 space-y-2">
                  {cartData?.items?.map((item: CartItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between w-full px-3 sm:px-4 text-gray-700 text-xs sm:text-sm py-1 border-b border-green-200 last:border-b-0"
                    >
                      <p className="text-[10px] sm:text-[12px] text-[#2B8E5D] font-medium">{`(${item.count})`}</p>
                      <p className="text-[10px] sm:text-[12px] truncate flex-1 text-left mx-2">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Total Price */}
                <div className="flex items-center justify-between w-full px-3 sm:px-4 mt-4 sm:mt-5 text-sm sm:text-base border-t border-green-300 pt-3">
                  <p className="font-bold text-[#2B8E5D]">{`${totalPrice.toLocaleString()} تومان`}</p>
                  <p className="text-gray-700">جمع سبد خرید</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  <p>{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm w-full"
                  >
                    تلاش مجدد
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-6 lg:mt-8 space-y-3">
              <Link
                href={"/pre-invoice"}
                className="h-12 sm:h-14 flex items-center justify-center duration-300 hover:shadow-lg cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-xl text-sm sm:text-base w-full font-medium"
                onClick={handlePreInvoiceClick}
              >
                دریافت پیش فاکتور و ادامه فرایند خرید
              </Link>
              <Link
                href={"/"}
                className="w-full h-12 flex items-center justify-center duration-300 cursor-pointer hover:shadow-lg hover:bg-[#da786f] text-white bg-[#c73d3d] rounded-xl text-sm sm:text-base font-medium"
              >
                لغو خرید
              </Link>
            </div>
          </div>
        </div>

        {/* Right content - Cart items list */}
        <div className="w-full lg:w-2/3 flex flex-col items-center px-3 sm:px-4 lg:px-0 order-1 lg:order-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl mt-2 sm:mt-4 py-2 px-4 text-[#2B8E5D] border-b-2 border-[#2B8E5D] font-bold w-full text-center lg:text-right">
            سبد خرید شما
          </h1>

          <div className="w-full flex-1 overflow-y-auto py-4">
            {cartLoading ? (
              <div className="w-full text-center py-8 sm:py-12 text-base sm:text-lg text-gray-600">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-[#2B8E5D] border-t-transparent rounded-full animate-spin mb-3"></div>
                  در حال بارگذاری سبد خرید...
                </div>
              </div>
            ) : error ? (
              <div className="w-full text-center py-8 sm:py-12 text-red-500 text-base sm:text-lg">
                {error}
              </div>
            ) : cartData?.items && cartData.items.length > 0 ? (
              <div className="space-y-3 sm:space-y-4 px-2">
                {cartData.items.map((item: CartItem) => (
                  <Cart
                    key={item.id}
                    image_src={item.image_src}
                    title={item.title}
                    desc={item.desc}
                    price={item.price}
                    count={item.count}
                    fixed={true}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full text-center py-8 sm:py-12 text-gray-500 text-base sm:text-lg flex flex-col items-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                سبد خرید خالی است
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}