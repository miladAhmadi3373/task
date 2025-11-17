// components/cart.tsx
import Image from "next/image";
import React from "react";

interface CartProps {
  image_src: string;
  title: string;
  price: number;
  desc: string;
  count: number;
  fixed?: boolean;
}

function Cart({ image_src, title, price, desc, count, fixed = false }: CartProps) {
  console.log(image_src);
  
  return (
    <div className={`w-[95%] mt-5 rounded-xl h-3/12 bg-white shadow flex py-3 justify-around pr-5 hover:shadow-2xl duration-300 ${fixed ? 'border-r-4 border-r-green-500' : ''}`}>
      <div className="text-left flex items-end justify-start h-full">
        <p className="text-md text-[#2B8E5D] pl-3 font-bold text-right"> 
          {price.toLocaleString()} تومان
        </p>
      </div>
      <div className="flex items-center w-full">
        <div className="flex flex-col pr-4 pt-3 flex-1">
          <h1 className="text-right text-lg font-bold">{title}</h1>
          <h2 className="text-right text-sm text-gray-600">{desc}</h2>
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-[14px] text-gray-600">تعداد:</span>
            <span className="text-[14px] font-bold">{count}</span>
            {fixed && (
              <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded">
                ثابت
              </span>
            )}
          </div>
        </div>
        <div className="w-32 h-24 bg-gray-200 rounded-xl flex items-center justify-center ml-4">
          <Image
            src={`/${image_src}`}
            width={80}
            height={80}
            alt={title}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default Cart;