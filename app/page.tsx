"use client";

import Image from "next/image";
import Cart from "@/components/cart";
import "./globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const shoppingCartItems = [
    {
      id: 1,
      image_src: "s24-phone.png",
      title: " s24 ultra گوشی موبایل سامسونگ مدل",
      desc: "...یکی از پرچمداران برند سامسونگ با لبه های تیز که به عنوان امضای کار شناخته میشود",
      price: 140000000,
      count: 2,
    },
    {
      id: 2,
      image_src: "redmi-phone.png",
      title: " redmi note 14 گوشی موبایل شیائومی مدل",
      desc: "...یکی از محبوبترین مدل های برند شیائومی که فروش نسبتا خوبی هم داشته",
      price: 20000000,
      count: 3,
    },
    {
      id: 3,
      image_src: "iphone16-phone.png",
      title: " iphone 16 pro max گوشی موبایل آیفون مدل",
      desc: "یکی از بهترین گوشی های این برند محبوب است که به عنوان رقیب اصلی سامسونگ محسوب میشود",
      price: 240000000,
      count: 1,
    },
  ];
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const newTotal = shoppingCartItems.reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );
    const newCount = shoppingCartItems.reduce(
      (acc, item) => acc + item.count,
      0
    );
    setTotalPrice(newTotal);
    setTotalCount(newCount);

    // Store shopping cart items in localStorage for pre-invoice page
    localStorage.setItem("shoppingCartItems", JSON.stringify(shoppingCartItems));
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* shoping cart content */}
      <div className="w-[87%] h-[87%] rounded-xl my-15 bg-gray-100 flex justify-between">
        {/* left content */}
        <div className="w-1/3 bg-green-100 shadow h-[95%] m-3 rounded-xl flex flex-col">
          <div className="text-center w-full mt-10 text-xl">سبد نهایی</div>
          <div className="flex flex-col justify-end pb-20 w-full h-full">
            <div className="bg-green-200 py-3 mx-6 rounded-xl">
              <div className="flex items-center justify-between w-[90%] mx-auto">
                <p>{`(${totalCount})`}</p>
                <p>تعداد کالا</p>
              </div>
              {shoppingCartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-end relative w-[90%] mx-auto text-gray-700">
                  <p className="text-[12px] absolute left-5">{`(${item.count})`}</p>
                  <p className="text-[12px]">{item.title}</p>
                </div>
              ))}
              <div className="flex items-center justify-between w-[90%] mx-auto mt-5">
                <p>{` (تومان ${totalPrice.toLocaleString()})`}</p>
                <p>جمع سبد خرید</p>
              </div>
            </div>
            <div className="w-[90%] mt-20 mx-auto">
              <Link
                href={"/pre-invoice"}
                className=" h-12 mb-5 flex items-center justify-center duration-300 hover:shadow-lg cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-xl"
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
        {/* right content */}
        <div className="w-2/3 flex flex-col items-center">
          <h1 className="text-xl mt-2 py-1 px-4 text-[#2B8E5D] border-b border-b-[#2B8E5D]">
            سبد خرید شما
          </h1>
          {shoppingCartItems.map((cart) => (
            <Cart
              key={cart.id}
              image_src={cart.image_src}
              title={cart.title}
              desc={cart.desc}
              price={cart.price}
              count={cart.count}
            />
          ))}
        </div>
      </div>
    </div>
  );
}