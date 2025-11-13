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
      count: 1,
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

  useEffect(() => {
    const newTotal = shoppingCartItems.reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );
    setTotalPrice(newTotal);
  }, []);

  return (
    <>
      {/* shoping cart content */}
      <div className="w-[87%] h-[87%] rounded-xl my-15 bg-gray-100 flex justify-between">
        {/* left content */}
        <div className="w-1/3 bg-green-100 shadow h-[95%] m-3 rounded-xl flex flex-col">
          <div className="text-center w-full mt-20 text-xl">سبد نهایی</div>
          <div className="flex flex-col justify-end pb-20 w-full h-full">
            <>
              <div className="flex items-center justify-between w-[90%] mx-auto">
                <p>{`(${shoppingCartItems.length})`}</p>
                <p>تعداد کالا</p>
              </div>
              <div className="flex items-center justify-between w-[90%] mx-auto mt-5">
                <p>{` (تومان ${totalPrice.toLocaleString()})`}</p>
                <p>جمع سبد خرید</p>
              </div>
            </>
            <Link
              href={"/pre-invoice"}
              className="w-[90%] mt-20 h-12 flex items-center justify-center duration-300 cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] mx-auto rounded-xl"
            >
              دریافت پیش فاکتور و ادامه فرایند خرید
            </Link>
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
    </>
  );
}
