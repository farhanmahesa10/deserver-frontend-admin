"use client";

import React, { useEffect } from "react";
import "nprogress/nprogress.css";

export default function AdminSkeleton() {
  return (
    <>
      <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold w-60">
        Loading data...
      </h1>
      <div className="flex justify-between lg:w-full md:w-[400px] min-w-[400px] md:gap-[10px] w-full mb-5">
        <div className="flex">
          <div className="mb-4 h-[30px] md:h-[48px] w-[130px] md:w-[240px] bg-gray-200 animate-pulse"></div>
        </div>
        <div className="flex gap-8">
          <div className="mb-4 h-[30px] md:h-[48px] w-[130px] md:w-[240px] bg-gray-200 animate-pulse"></div>
        </div>
      </div>
      <div className="flex">
        <div className="w-full rounded-lg shadow-md h-80 bg-gray-200 animate-pulse"></div>
      </div>
    </>
  );
}
