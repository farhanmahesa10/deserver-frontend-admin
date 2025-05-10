"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { IoExit, IoPersonCircle } from "react-icons/io5";
import HanldeRemove from "../handleRemove/handleRemove";
import { usePathname } from "next/navigation";
import { IoNotifications } from "react-icons/io5";
import { useSelector } from "react-redux";
import socket from "../socket/socketIo";

export default function Header({ isOpen, onClickHeader }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [url, setUrl] = useState("");
  const [showNotifBox, setShowNotifBox] = useState(false); // untuk buka/tutup box
  const [order, setOrder] = useState([]); // daftar order aktif
  const [notifCount, setNotifCount] = useState(0); // angka di ikon
  const [hasSeenNotif, setHasSeenNotif] = useState(false);
  const dataOutlet = useSelector((state) => state.counter.outlet);

  const handleNotif = () => {
    if (!showNotifBox) {
      // Buka notif box (bg abu-abu tetap)
      setShowNotifBox(true);
    } else {
      // Tutup notif box → baru tandai semua notif sudah dilihat (seen: true)
      setShowNotifBox(false);
      setOrder((prev) =>
        prev.map((item) => ({
          ...item,
          seen: true,
        }))
      );
      setNotifCount(0);
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
      setOrder((prev) => [newOrder, ...prev]);
      setNotifCount((prev) => prev + 1);
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
              <div className="absolute right-20 top-16 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 shadow-lg rounded-lg z-20">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Notifikasi Order</h3>
                  {order.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Belum ada notifikasi.
                    </p>
                  ) : (
                    <ul className="mt-2 max-h-64 overflow-y-auto space-y-2">
                      {order.map((item, index) => (
                        <li
                          key={index}
                          className={`p-2 rounded-md shadow-sm text-sm ${
                            !item.seen ? "bg-gray-200/70" : "bg-white"
                          }`}
                        >
                          <p>
                            <strong>Nomor Order:</strong> {item?.order_code}
                          </p>
                          <p>
                            <strong>Alasan:</strong>{" "}
                            {item?.cancel_reason || "Tanpa alasan"}
                          </p>
                        </li>
                      ))}
                    </ul>
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
