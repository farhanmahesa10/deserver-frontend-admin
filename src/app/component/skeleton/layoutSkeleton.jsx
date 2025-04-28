"use client";

import React, { useEffect } from "react";
import "nprogress/nprogress.css";

export default function LayoutSkeleton() {
  return (
    <div className="flex flex-wrap container">
      <header className="fixed top-0 left-0 w-full h-20 flex items-center z-10 shadow-md bg-white">
        <div className="container flex justify-between items-center">
          <div className="flex p-1 w-28 h-16 ml-8 ">
            <div className="mb-4 w-full h-full bg-gray-200 animate-pulse"></div>
          </div>
          <div className=" flex  mr-16 lg:mr-0">
            <div className="mb-4 h-[48px] w-[50px] md:w-[110px] bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </header>

      <div
        className={`hidden lg:flex lg:flex-wrap p-5 rounded-lg h-[630px] w-[250px]  lg:border-r lg:border-lightgray mt-20  `}
      >
        <div
          className={`bg-gray-100 animate-pulse lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg`}
        ></div>
        <div
          className={`bg-gray-100 animate-pulse lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg`}
        ></div>
        <div
          className={`bg-gray-100 animate-pulse lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg`}
        ></div>
        <div
          className={`bg-gray-100 animate-pulse lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg`}
        ></div>
        <div
          className={`bg-gray-100 animate-pulse lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg`}
        ></div>
        <div
          className={`bg-gray-100 animate-pulse lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg`}
        ></div>
        <div
          className={`bg-gray-100 animate-pulse lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg`}
        ></div>
      </div>
    </div>
  );
}
