"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IoExit } from "react-icons/io5";

export default function Header({ isOpen, onClickHeader }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };
  return (
    <header className="fixed top-0 left-0 w-full h-20 flex items-center z-10 shadow-md bg-white">
      <div className="container flex justify-between items-center">
        <div className="flex p-1 w-28 h-16 ml-8 ">
          <img
            src={`/img/logo.png`}
            className="w-full h-full object-contain"
            alt="Logo"
          />
        </div>
        <div className="flex gap-5  mr-16 lg:mr-0">
          <button
            onClick={handleLogout}
            className="flex gap-2 items-center cursor-pointer rounded-md h-8 p-4 shadow-inner border-[1px] border-lightgray hover:bg-red-600"
          >
            <IoExit />
            <h1 className="body-text-sm-normal font-nunitoSans ">Logout</h1>
          </button>
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
