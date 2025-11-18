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
      <div className="flex items-center justify-center w-full h-full text-base md:text-lg">
        در حال بررسی ورود...
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-2 md:p-0">
      {/* Shopping cart content */}
      <div className="w-full md:w-[87%] h-full md:h-[87%] rounded-xl bg-gray-100 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
        {/* Left sidebar - Cart summary */}
        <div className="w-full md:w-1/3 bg-green-100 shadow h-auto md:h-[95%] m-3 rounded-xl flex flex-col">
          <div className="text-center w-full mt-6 md:mt-10 text-lg md:text-xl">سبد نهایی</div>
          <div className="flex flex-col justify-end pb-10 md:pb-20 w-full h-full">
            <div className="bg-green-200 py-3 mx-4 md:mx-6 rounded-xl">
              <div className="flex items-center justify-between w-[90%] mx-auto text-sm md:text-base">
                <p>{`(${totalCount})`}</p>
                <p>تعداد کالا</p>
              </div>
              {cartData?.items?.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-end relative w-[90%] mx-auto text-gray-700 text-xs md:text-sm"
                >
                  <p className="text-[10px] md:text-[12px] absolute left-3 md:left-5">{`(${item.count})`}</p>
                  <p className="text-[10px] md:text-[12px] truncate max-w-[120px] md:max-w-[150px]">
                    {item.title}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between w-[90%] mx-auto mt-4 md:mt-5 text-sm md:text-base">
                <p>{`${totalPrice.toLocaleString()} تومان`}</p>
                <p>جمع سبد خرید</p>
              </div>
            </div>

            {error && (
              <div className="mx-4 md:mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm md:text-base">
                <p>{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-3 md:px-4 py-1 md:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm md:text-base"
                >
                  تلاش مجدد
                </button>
              </div>
            )}

            <div className="w-[90%] mt-10 md:mt-20 mx-auto space-y-4">
              <Link
                href={"/pre-invoice"}
                className="h-10 md:h-12 mb-3 md:mb-5 flex items-center justify-center duration-300 hover:shadow-lg cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-xl text-sm md:text-base w-full"
                onClick={handlePreInvoiceClick}
              >
                دریافت پیش فاکتور و ادامه فرایند خرید
              </Link>
              <Link
                href={"/"}
                className="w-full md:w-[50%] mx-auto h-10 flex items-center justify-center duration-300 cursor-pointer hover:shadow-lg hover:bg-[#da786f] text-white bg-[#c73d3d] rounded-xl text-sm md:text-base"
              >
                لغو خرید
              </Link>
            </div>
          </div>
        </div>

        {/* Right content - Cart items list */}
        <div className="w-full md:w-2/3 flex flex-col items-center px-2 md:px-0">
          <h1 className="text-lg md:text-xl mt-2 py-1 px-3 md:px-4 text-[#2B8E5D] border-b border-b-[#2B8E5D]">
            سبد خرید شما
          </h1>

          {cartLoading ? (
            <div className="w-full text-center py-8 md:py-10 text-base md:text-lg">
              در حال بارگذاری سبد خرید...
            </div>
          ) : error ? (
            <div className="w-full text-center py-8 md:py-10 text-red-500 text-base md:text-lg">{error}</div>
          ) : cartData?.items && cartData.items.length > 0 ? (
            cartData.items.map((item: CartItem) => (
              <Cart
                key={item.id}
                image_src={item.image_src}
                title={item.title}
                desc={item.desc}
                price={item.price}
                count={item.count}
                fixed={true}
              />
            ))
          ) : (
            <div className="w-full text-center py-8 md:py-10 text-gray-500 text-base md:text-lg">
              سبد خرید خالی است
            </div>
          )}
        </div>
      </div>
    </div>
  );
}