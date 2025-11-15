import Image from "next/image";
import React from "react";

function cart({
  image_src,
  title,
  price,
  desc,
  count,
}: {
  image_src: string;
  title: string;
  price: number;
  desc: string;
  count: number;
}) {
  return (
    <div className="w-[95%] mt-5 rounded-xl h-3/12 bg-white shadow flex py-3 justify-around pr-5 hover:shadow-2xl duration-300">
      <div className="text-left flex items-end justify-start h-full">
        <p className="text-md text-[#2B8E5D] pl-3 font-bold text-right"> {price.toLocaleString()} تومان</p>
      </div>
      <>
        <div className="flex flex-col pr-4 pt-3 w-120">
          <h1 className="text-right text-lg font-bold">{title}</h1>
          <h2 className="text-right text-sm text-gray-600">{desc}</h2>
        </div>
        <Image
          src={`/${image_src}`}
          width={110}
          height={85}
          alt="phone-img"
          className="bg-cover"
        />
      </>
    </div>
  );
}

export default cart;
