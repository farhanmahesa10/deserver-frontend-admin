"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "nextjs-toploader/app";
import { useDispatch, useSelector } from "react-redux";
import { setCollapse } from "@/store/slice";
import { Collapse } from "react-collapse";
import {
  IoBagHandle,
  IoCallSharp,
  IoImages,
  IoStorefront,
  IoCaretForward,
} from "react-icons/io5";
import { BiSolidFoodMenu } from "react-icons/bi";
import {
  MdFastfood,
  MdOutlineFoodBank,
  MdTableRestaurant,
} from "react-icons/md";
import { TfiGallery } from "react-icons/tfi";
import SidebarComp from "./sidebarComponent";

function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const router = useRouter();
  const dataOutlet = useSelector((state) => state.counter.outlet);
  const dispatch = useDispatch();
  const collapse = useSelector((state) => state.counter.collapse);

  useEffect(() => {
    setUrl(pathname);
  }, [pathname]);

  const handleRoute = (route) => {
    setIsOpen(false);
    router.push(route);
  };

  // Cek token
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
    <aside
      className={`${
        isOpen ? "flex" : "hidden"
      } fixed z-50 top-0 pt-4 px-4 right-0 mt-20 bg-white shadow-lg rounded-lg lg:shadow-none lg:rounded-none lg:static lg:flex lg:w-[250px] w-[200px] h-[calc(100vh-80px)] transition-all duration-300`}
    >
      <div className="flex flex-col w-full gap-6 overflow-y-auto overflow-x-hidden p-5 lg:p-0 custom-scrollbar ">
        {/* TRANSAKSI */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs text-gray-500 font-semibold uppercase tracking-widest px-1">
            Transaksi
          </h3>

          <SidebarComp
            handleRoute={() => handleRoute("/")}
            url={url}
            route={"/"}
            icon={<IoBagHandle />}
            menuName={"Transaction"}
          />

          <SidebarComp
            handleRoute={() => handleRoute("/admin/history")}
            url={url}
            route={"/admin/history"}
            icon={<IoBagHandle />}
            menuName={"History"}
          />
        </div>

        <hr className="border-gray-200" />

        {/* DATA MASTER */}
        <div className="flex flex-col gap-1">
          <div
            className="flex items-center justify-between px-1 cursor-pointer"
            onClick={() => dispatch(setCollapse(!collapse))}
          >
            <h3 className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
              Data Master
            </h3>
            <IoCaretForward
              className={`text-black transition-transform duration-300 ${
                collapse ? "rotate-90" : ""
              }`}
            />
          </div>

          <Collapse isOpened={collapse}>
            <div className="mt-2 flex flex-col gap-2">
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
          </Collapse>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
