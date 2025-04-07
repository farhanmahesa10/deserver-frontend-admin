"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { IoExit, IoPersonCircle } from "react-icons/io5";
import HanldeRemove from "../handleRemove/handleRemove";
import { usePathname } from "next/navigation";

export default function Header({ isOpen, onClickHeader }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataToRemove, setDataToRemove] = useState(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(pathname);
  }, [pathname]);

  const confirmRemove = () => {
    setDataToRemove();
    setShowConfirmModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/admin");
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
            onClick={() => handleProfile()}
            className="flex gap-2 items-center cursor-pointer rounded-xl h-8  "
          >
            <IoPersonCircle
              className={`${
                url == "/admin" ? "text-yellow-700 scale-110" : ""
              } w-8 h-8 transition-all duration-300 hover:scale-110 hover:text-yellow-700`}
            />
          </button>
          <button
            onClick={() => confirmRemove()}
            className="flex gap-2 items-center cursor-pointer rounded-md h-8 px-4 shadow-inner border border-lightgray bg-white 
             hover:bg-yellow-700 hover:text-white hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <IoExit className="text-inherit" />
            <h1 className="body-text-sm-normal font-nunitoSans">Logout</h1>
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

      {/* modal konfirmasi delete */}
      {showConfirmModal && (
        <HanldeRemove
          handleRemove={handleLogout}
          setShowConfirmModal={() => setShowConfirmModal(false)}
          text={"Exit"}
          confirmation={"Are you sure you want to exit?"}
        />
      )}
    </header>
  );
}
