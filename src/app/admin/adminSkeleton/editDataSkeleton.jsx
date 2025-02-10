"use client";

import React, { useEffect } from "react";
import "nprogress/nprogress.css";

export default function EditDataSkeleton() {
  return (
    <>
      <div className="flex">
        <div className="w-full rounded-lg shadow-md h-80 bg-gray-200 animate-pulse"></div>
      </div>
    </>
  );
}
