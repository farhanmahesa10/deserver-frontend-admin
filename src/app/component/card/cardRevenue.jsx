"use client";

import React from "react";

const CardRevenue = (props) => {
  const { value, desc, classRevenue } = props;

  return (
    <div
      className={`bg-green-100 text-green-700 p-2 text-xs rounded-md w-[120px] md:w-[150px] lg:w-full shadow-sm ${classRevenue}`}
    >
      <h1 className=" text-center font-semibold">{value}</h1>
      <h2 className=" text-center font-medium mt-1">{desc}</h2>
    </div>
  );
};

export default CardRevenue;
