// app/shoppingCart/page.tsx
"use client";

import Image from "next/image";
import Cart from "@/components/cart";
import "../globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

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

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

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

  const handlePreInvoiceClick = (): void => {
    if (cartData) {
      localStorage.setItem("shoppingCartItems", JSON.stringify(cartData));
    }
  };

  const handleRetry = (): void => {
    fetchCart();
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        در حال بررسی ورود...
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Shopping cart content */}
      <div className="w-[87%] h-[87%] rounded-xl my-15 bg-gray-100 flex justify-between">
        {/* Left sidebar - Cart summary */}
        <div className="w-1/3 bg-green-100 shadow h-[95%] m-3 rounded-xl flex flex-col">
          <div className="text-center w-full mt-10 text-xl">سبد نهایی</div>
          <div className="flex flex-col justify-end pb-20 w-full h-full">
            <div className="bg-green-200 py-3 mx-6 rounded-xl">
              <div className="flex items-center justify-between w-[90%] mx-auto">
                <p>{`(${totalCount})`}</p>
                <p>تعداد کالا</p>
              </div>
              {cartData?.items?.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-end relative w-[90%] mx-auto text-gray-700"
                >
                  <p className="text-[12px] absolute left-5">{`(${item.count})`}</p>
                  <p className="text-[12px] truncate max-w-[150px]">
                    {item.title}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between w-[90%] mx-auto mt-5">
                <p>{`${totalPrice.toLocaleString()} تومان`}</p>
                <p>جمع سبد خرید</p>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  تلاش مجدد
                </button>
              </div>
            )}

            <div className="w-[90%] mt-20 mx-auto">
              <Link
                href={"/pre-invoice"}
                className=" h-12 mb-5 flex items-center justify-center duration-300 hover:shadow-lg cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-xl"
                onClick={handlePreInvoiceClick}
              >
                دریافت پیش فاکتور و ادامه فرایند خرید
              </Link>
              <Link
                href={"/"}
                className="w-[50%] mx-auto h-10 flex items-center justify-center duration-300 cursor-pointer hover:shadow-lg hover:bg-[#da786f] text-white bg-[#c73d3d] rounded-xl"
              >
                لغو خرید
              </Link>
            </div>
          </div>
        </div>

        {/* Right content - Cart items list */}
        <div className="w-2/3 flex flex-col items-center">
          <h1 className="text-xl mt-2 py-1 px-4 text-[#2B8E5D] border-b border-b-[#2B8E5D]">
            سبد خرید شما
          </h1>

          {cartLoading ? (
            <div className="w-full text-center py-10">
              در حال بارگذاری سبد خرید...
            </div>
          ) : error ? (
            <div className="w-full text-center py-10 text-red-500">{error}</div>
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
            <div className="w-full text-center py-10 text-gray-500">
              سبد خرید خالی است
            </div>
          )}
        </div>
      </div>
    </div>
  );
}