"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header({ isOpen, onClickHeader }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };
  return (
    <header className="fixed top-0 left-0 w-full h-20 flex items-center z-10 shadow-md bg-white">
      <div className="container flex justify-between items-center">
        <div>
          <h1 className=" md:dekstop-display-h2 text-yellow-700 font-pacifico">
            MenuCafeKu
          </h1>
        </div>
        <div className="flex gap-5  mr-16 lg:mr-0">
          <div className="flex gap-2 items-center cursor-pointer rounded-md h-8 p-4 shadow-inner border-[1px] border-lightgray hover:bg-red-600">
            <div className="w-[16px] h-[16px]">
              <img src="/img/logout.png" alt="vector" className="" />
            </div>
            <h1
              className="body-text-sm-normal font-nunitoSans text-primary50"
              onClick={handleLogout}
            >
              Logout
            </h1>
          </div>
        </div>
        <button
          onClick={onClickHeader}
          id="hamburger"
          name="hamburger"
          type="button"
          className={`${
            !isOpen ? "" : "hamburger-active"
          } block absolute right-4 z-30 lg:hidden`}
        >
          <span className="hamburger-line transition duration-300 ease-in-out bg-black origin-top-left "></span>
          <span className="hamburger-line transition duration-300 ease-in-out bg-black"></span>
          <span className="hamburger-line transition duration-300 ease-in-out bg-black origin-bottom-left"></span>
        </button>
      </div>
    </header>
  );
}
