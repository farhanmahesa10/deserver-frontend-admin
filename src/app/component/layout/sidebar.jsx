"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  IoBagHandle,
  IoCallSharp,
  IoImages,
  IoPersonSharp,
  IoStorefront,
} from "react-icons/io5";
import { BiSolidFoodMenu } from "react-icons/bi";
import {
  MdFastfood,
  MdOutlineFoodBank,
  MdTableRestaurant,
} from "react-icons/md";
import { TfiGallery } from "react-icons/tfi";

function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setUrl(pathname);
  }, [pathname]);

  const handleSetIsOpen = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("refreshToken");

    if (savedToken) {
      const decoded = jwtDecode(savedToken);
      const outlet_id = decoded.id;
      const expirationTime = new Date(decoded.exp * 1000);
      const currentTime = new Date();

      if (currentTime > expirationTime) {
        localStorage.clear();
      } else {
        axios
          .get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outlet_id}`
          )
          .then((response) => {
            const data = response.data;
            setRole(data.role);
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    }
  }, []);

  return (
    <div
      className={`${
        isOpen ? "" : "hidden"
      } absolute p-5 bg-white shadow-lg rounded-lg lg:shadow-none lg:rounded-none right-4 max-w-[250px] w-[200px] lg:flex lg:static lg:w-[250px] lg:border-r lg:border-lightgray mt-20 lg:h-[630px] h-[610px] transition-all duration-300`}
    >
      <div className="flex flex-wrap gap-5 pt-4 h-[500px]">
        <Link
          onClick={() => handleSetIsOpen()}
          href="/"
          className={`${
            url == "/" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <IoBagHandle />
          </div>
          Transaction
        </Link>

        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/outlet"
          className={`${role !== "admin" ? "hidden" : ""} ${
            url == "/admin/outlet" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <IoStorefront />
          </div>
          Outlet
        </Link>
        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin"
          className={`${role === "admin" ? "hidden" : ""} ${
            url == "/admin" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <IoPersonSharp />
          </div>
          Profile
        </Link>

        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/category"
          className={`${
            url == "/admin/category"
              ? "bg-yellow-700 text-white"
              : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <BiSolidFoodMenu />
          </div>
          Category
        </Link>

        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/subCategory"
          className={`${
            url == "/admin/subCategory"
              ? "bg-yellow-700 text-white"
              : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <MdOutlineFoodBank />
          </div>
          Sub Category
        </Link>

        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/menu"
          className={`${
            url == "/admin/menu" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <MdFastfood />
          </div>
          Menu
        </Link>
        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/gallery"
          className={`${
            url == "/admin/gallery" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <IoImages />
          </div>
          Gallery
        </Link>

        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/event"
          className={`${
            url == "/admin/event" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <TfiGallery />
          </div>
          Event
        </Link>

        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/table"
          className={`${
            url == "/admin/table" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white  hover:shadow-md transition duration-300`}
        >
          <div className="mb-1 ">
            <MdTableRestaurant />
          </div>
          Table
        </Link>
        <Link
          onClick={() => handleSetIsOpen()}
          href="/admin/contact"
          className={`${
            url == "/admin/contact" ? "bg-yellow-700 text-white" : "bg-gray-100"
          } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
        >
          <div className="mb-1">
            <IoCallSharp />
          </div>
          Contact
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
