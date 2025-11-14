"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface CartItem {
  id: number;
  image_src: string;
  title: string;
  desc: string;
  price: number;
  count: number;
}

function page() {
  const [shoppingCartItems, setShoppingCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    // Retrieve shopping cart items from localStorage
    const storedItems = localStorage.getItem("shoppingCartItems");
    if (storedItems) {
      const parsedItems: CartItem[] = JSON.parse(storedItems);
      setShoppingCartItems(parsedItems);

      const newTotal = parsedItems.reduce(
        (acc: number, item: CartItem) => acc + item.price * item.count,
        0
      );
      const newCount = parsedItems.reduce(
        (acc: number, item: CartItem) => acc + item.count,
        0
      );
      setTotalPrice(newTotal);
      setTotalCount(newCount);
    }

    // Get current date and time
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
  }, []);

  return (
    <div className="flex items-center justify-evenly w-full h-full" dir="rtl">
      {/* Pre-invoice content */}
      <div className="w-[50%] h-auto my-3 bg-white shadow-lg rounded-2xl p-4 flex flex-col">
        <h1 className="text-2xl text-center mb-8 text-[#2B8E5D] border-b-2 border-[#2B8E5D] pb-4 font-bold">پیش فاکتور</h1>
        
        {/* Date and Time */}
        <div className="mb-4 text-right text-lg text-gray-700">
          <p>تاریخ و ساعت صدور: {currentDateTime}</p>
        </div>

        {/* Items List */}
        <div className="bg-gray-50 rounded-xl shadow-inner p-6">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#2B8E5D] text-white">
                <th className="p-3 border border-gray-300">تصویر</th>
                <th className="p-3 border border-gray-300">عنوان</th>
                <th className="p-3 border border-gray-300">توضیح</th>
                <th className="p-3 border border-gray-300">تعداد</th>
                <th className="p-3 border border-gray-300">قیمت واحد</th>
                <th className="p-3 border border-gray-300">جمع</th>
              </tr>
            </thead>
            <tbody>
              {shoppingCartItems.map((item: CartItem) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="p-3 border border-gray-300">
                    <img
                      src={item.image_src}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-md mx-auto"
                    />
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-800 font-medium">{item.title}</td>
                  <td className="p-3 border border-gray-300 text-gray-600 text-sm">{item.desc}</td>
                  <td className="p-3 border border-gray-300 text-center">{item.count}</td>
                  <td className="p-3 border border-gray-300 text-right">{item.price.toLocaleString()} تومان</td>
                  <td className="p-3 border border-gray-300 text-right font-medium">{(item.price * item.count).toLocaleString()} تومان</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 font-bold">
                <td colSpan={3} className="p-3 border border-gray-300 text-right">تعداد کالا: {totalCount}</td>
                <td colSpan={3} className="p-3 border border-gray-300 text-right">جمع کل: {totalPrice.toLocaleString()} تومان</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirmation section */}
      <div className="w-[30%] h-[40%] bg-gray-100 shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center mt-5">
        <p className="mb-8 text-lg text-gray-800">آیا از صحت اطلاعات اطمینان دارید؟</p>
        <div className="w-full flex items-center justify-center mb-6">
          <Link
            href={"/payment"}
            className="px-6 py-3 flex items-center justify-center duration-300 hover:shadow-xl cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-xl text-sm font-medium"
          >
            تایید و ادامه فرایند خرید
          </Link>
          <button
            className="mr-4 px-6 py-3 flex items-center justify-center duration-300 hover:shadow-xl cursor-pointer hover:bg-[#5656c4] text-white bg-[#253895] rounded-xl text-sm font-medium"
          >
            دریافت فایل پیش فاکتور
          </button>
        </div>
        <Link
          href={"/"}
          className="text-[#c73d3d] border-b-2 border-[#c73d3d] hover:text-[#da786f] duration-300 cursor-pointer text-base"
        >
          لغو خرید
        </Link>
      </div>
    </div>
  );
}

export default page;