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
    <div className={`w-full mt-4 sm:mt-5 rounded-xl bg-white shadow flex flex-col sm:flex-row py-3 sm:py-4 px-3 sm:pr-5 hover:shadow-2xl duration-300 ${fixed ? 'border-r-2 sm:border-r-4 border-r-green-500' : ''}`}>
      {/* Price Section - Mobile First */}
      <div className="sm:text-left flex items-center justify-between sm:justify-start sm:items-end h-auto sm:h-full order-2 sm:order-1 sm:w-auto w-full mt-3 sm:mt-0">
        <p className="text-sm sm:text-md text-[#2B8E5D] font-bold text-left sm:text-right"> 
          {price.toLocaleString()} تومان
        </p>
        {/* Fixed badge for mobile */}
        {fixed && (
          <span className="sm:hidden text-[10px] bg-green-500 text-white px-2 py-1 rounded">
            ثابت
          </span>
        )}
      </div>
      
      {/* Content Section */}
      <div className="flex items-center w-full order-1 sm:order-2">
        {/* Image */}
        <div className="w-20 h-16 sm:w-32 sm:h-24 bg-gray-200 rounded-xl flex items-center justify-center ml-2 sm:ml-4 flex-shrink-0">
          <Image
            src={`/${image_src}`}
            width={64}
            height={64}
            alt={title}
            className="object-contain w-12 h-12 sm:w-16 sm:h-16"
          />
        </div>
        
        {/* Text Content */}
        <div className="flex flex-col pr-2 sm:pr-4 pt-1 sm:pt-3 flex-1">
          <h1 className="text-right text-base sm:text-lg font-bold line-clamp-1">{title}</h1>
          <h2 className="text-right text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">{desc}</h2>
          <div className="flex items-center justify-end gap-2 mt-2 sm:mt-2">
            <span className="text-[12px] sm:text-[14px] text-gray-600">تعداد:</span>
            <span className="text-[12px] sm:text-[14px] font-bold">{count}</span>
            {/* Fixed badge for desktop */}
            {fixed && (
              <span className="hidden sm:inline text-[10px] bg-green-500 text-white px-2 py-1 rounded">
                ثابت
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;