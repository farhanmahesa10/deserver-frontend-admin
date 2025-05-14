"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import {
  IoExit,
  IoPersonCircle,
  IoChatboxEllipsesOutline,
  IoNotifications,
} from "react-icons/io5";
import HanldeRemove from "../handleRemove/handleRemove";
import { usePathname } from "next/navigation";
import { MdOutlineSmsFailed } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addOrderNotif, markAllSeen, resetNotifCount } from "@/store/slice";
import socket from "../socket/socketIo";
import { FormatDate, FormatDateAndTime } from "../utils/formatDate";

export default function Header({ isOpen, onClickHeader }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [url, setUrl] = useState("");
  const [showNotifBox, setShowNotifBox] = useState(false); // untuk buka/tutup box
  const dataOutlet = useSelector((state) => state.counter.outlet);
  const dispatch = useDispatch();
  const order = useSelector((state) => state.counter.order);
  const notifCount = useSelector((state) => state.counter.notifCount);

  const handleNotif = () => {
    if (!showNotifBox) {
      setShowNotifBox(true); // buka box, bg tetap
    } else {
      setShowNotifBox(false);
      dispatch(markAllSeen()); // tandai semua sudah dilihat
      dispatch(resetNotifCount()); // reset angka notif
    }
  };

  useEffect(() => {
    setUrl(pathname);
  }, [pathname]);

  const confirmLogout = () => {
    setShowConfirmModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/admin");
  };

  useEffect(() => {
    if (!dataOutlet?.outlet_code) return;

    if (!socket?.connected) {
      socket.on("connect", () => {
        socket.emit("joinCafe", dataOutlet.outlet_code);
      });
    } else {
      socket.emit("joinCafe", dataOutlet.outlet_code);
    }

    socket.on("AdminReceiveCanceled", (orderData) => {
      const newOrder = { ...orderData, seen: false };

      dispatch(addOrderNotif(newOrder));
      // setNotifCount((prev) => prev + 1);
    });

    return () => {
      socket.off("AdminReceiveCanceled");
      // socket.disconnect();
    };
  }, [dataOutlet?.outlet_code]);

  return (
    <header className="fixed top-0 left-0 w-full h-20 flex items-center z-10 shadow-md bg-white">
      <div className="container flex justify-between items-center ">
        <div className="flex p-1 w-28 h-16 ml-8 ">
          <img
            src={`/img/logo.png`}
            className="w-full h-full object-contain"
            alt="Logo"
          />
        </div>
        <div className="flex gap-5 relative">
          <div className="flex gap-5   lg:mr-0">
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
              onClick={handleNotif}
              className="relative flex items-center cursor-pointer rounded-md h-[30px] px-4 mt-1 shadow-inner border border-lightgray bg-white 
            hover:bg-yellow-700 hover:text-white hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <IoNotifications />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
            <button
              onClick={() => confirmLogout()}
              className="flex items-center cursor-pointer rounded-md h-[30px] px-4 mt-1 shadow-inner border border-lightgray bg-white 
             hover:bg-yellow-700 hover:text-white hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <IoExit className="text-inherit" />
            </button>
            {showNotifBox && (
              <div className="absolute right-20 top-16 w-80 max-h-72 bg-white border border-gray-300 shadow-lg rounded-lg z-20  ">
                <div className="p-2">
                  <h3 className="font-semibold mb-2">Notification Orders</h3>
                  {order.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No notification yet.
                    </p>
                  ) : (
                    <div className="mt-2 max-h-52 overflow-y-auto overflow-x-hidden  custom-scrollbar space-y-2">
                      {order.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-2 rounded-xl shadow-sm hover:bg-gray-50 transition ${
                            !item.seen ? "bg-gray-200/70" : "bg-white"
                          }`}
                        >
                          {item.status == "failed" ? (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-red-100 text-red-600 flex items-center justify-center rounded-full text-lg">
                                <MdOutlineSmsFailed />
                              </div>
                            </div>
                          ) : (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-full text-lg">
                                <IoChatboxEllipsesOutline />
                              </div>
                            </div>
                          )}

                          {/* Isi Notifikasi */}
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold text-black">
                                Room {item.number_table}
                              </span>{" "}
                              {item.status == "failed"
                                ? "cancel the"
                                : "create the"}{" "}
                              order
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {FormatDateAndTime(item.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClickHeader}
            id="hamburger"
            name="hamburger"
            type="button"
            className={`${
              !isOpen ? "" : "hamburger-active"
            } block  right-4 z-30 lg:hidden`}
          >
            <span className="hamburger-line transition duration-300 ease-in-out bg-black origin-top-left "></span>
            <span className="hamburger-line transition duration-300 ease-in-out bg-black"></span>
            <span className="hamburger-line transition duration-300 ease-in-out bg-black origin-bottom-left"></span>
          </button>
        </div>
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
