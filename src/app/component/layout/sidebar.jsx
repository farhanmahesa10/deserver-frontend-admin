"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  IoBagHandle,
  IoCallSharp,
  IoImages,
  IoStorefront,
} from "react-icons/io5";
import { BiSolidFoodMenu } from "react-icons/bi";
import {
  MdFastfood,
  MdOutlineFoodBank,
  MdTableRestaurant,
} from "react-icons/md";
import { TfiGallery } from "react-icons/tfi";
import { handleApiError } from "../handleError/handleError";
import { useRouter } from "nextjs-toploader/app";
import SidebarComp from "./sidebarComponent";
import { useSelector } from "react-redux";

function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const router = useRouter();
  const dataOutlet = useSelector((state) => state.counter.outlet);

  useEffect(() => {
    setUrl(pathname);
  }, [pathname]);

  const handleRoute = (route) => {
    setIsOpen(false);
    router.push(route);
  };

  // cek token
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const decoded = jwtDecode(refreshToken);
      const expirationTime = new Date(decoded.exp * 1000);
      const currentTime = new Date();

      if (currentTime > expirationTime) {
        localStorage.clear();
        router.push(`/login`);
      }
    } else {
      router.push(`/login`);
    }
  }, []);

  return (
    <div
      className={`${
        isOpen ? "" : "hidden"
      } absolute p-5 bg-white shadow-lg rounded-lg lg:shadow-none lg:rounded-none right-4 max-w-[250px] w-[200px] lg:flex lg:static lg:w-[250px] lg:border-r lg:border-lightgray mt-20 lg:h-[630px] h-[610px] transition-all duration-300`}
    >
      <div className="flex flex-wrap gap-5 pt-4 h-[500px]">
        <SidebarComp
          handleRoute={() => handleRoute("/")}
          url={url}
          route={"/"}
          icon={<IoBagHandle />}
          menuName={"Transaction"}
        />

        <SidebarComp
          handleRoute={() => handleRoute("/admin/outlet")}
          url={url}
          route={"/admin/outlet"}
          roleAdmin={`${dataOutlet.role !== "admin" ? "hidden" : ""}`}
          icon={<IoStorefront />}
          menuName={"Outlet"}
        />

        <SidebarComp
          handleRoute={() => handleRoute("/admin/table")}
          url={url}
          route={"/admin/table"}
          icon={<MdTableRestaurant />}
          menuName={"Room"}
        />
        <SidebarComp
          handleRoute={() => handleRoute("/admin/category")}
          url={url}
          route={"/admin/category"}
          icon={<BiSolidFoodMenu />}
          menuName={"Category"}
        />
        <SidebarComp
          handleRoute={() => handleRoute("/admin/subCategory")}
          url={url}
          route={"/admin/subCategory"}
          icon={<MdOutlineFoodBank />}
          menuName={"Sub Category"}
        />

        <SidebarComp
          handleRoute={() => handleRoute("/admin/menu")}
          url={url}
          route={"/admin/menu"}
          icon={<MdFastfood />}
          menuName={"Menu"}
        />

        <SidebarComp
          handleRoute={() => handleRoute("/admin/gallery")}
          url={url}
          route={"/admin/gallery"}
          icon={<IoImages />}
          menuName={"Gallery"}
        />

        <SidebarComp
          handleRoute={() => handleRoute("/admin/event")}
          url={url}
          route={"/admin/event"}
          icon={<TfiGallery />}
          menuName={"Event"}
        />

        <SidebarComp
          handleRoute={() => handleRoute("/admin/contact")}
          url={url}
          route={"/admin/contact"}
          icon={<IoCallSharp />}
          menuName={"Contact"}
        />
      </div>
    </div>
  );
}

export default Sidebar;
