import React from "react";
import { TbDatabaseExclamation } from "react-icons/tb";

export function NotData() {
  return (
    <div className="flex flex-wrap justify-center mt-6 ">
      <div className="w-full  ">
        <TbDatabaseExclamation className="w-20 mx-auto h-full text-slate-400" />
      </div>

      <p className="text-slate-400 text-bold">
        No data found, please add to create data!
      </p>
    </div>
  );
}
