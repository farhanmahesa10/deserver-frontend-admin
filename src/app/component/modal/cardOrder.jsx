"use client";

import React from "react";

const CardOrder = (props) => {
  const { searchQuery = [], setDataPesanan, setCardOrderOpen } = props;
  // Pastikan fungsi ini ada atau diimport
  const formatIDR = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  const closeModal = () => {
    setDataPesanan([]);
    setCardOrderOpen(false);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4 overflow-y-auto">
      <div className="flex justify-center w-full">
        <div className=" max-w-md w-full">
          {searchQuery.map((item) => (
            <div
              key={item.id}
              className="relative bg-white border border-gray-300 shadow-sm rounded-lg p-4 w-full flex flex-col justify-between mb-6"
            >
              {/* Nomor Meja */}
              <div className="absolute top-0 left-0 rounded-tl-md rounded-br-md bg-white border w-14 h-8 flex items-center justify-center font-bold text-sm">
                {item.id_table}
              </div>

              {/* Status */}
              <div
                className={`absolute top-0 right-0 px-2 py-1 w-16 h-8 text-xs rounded-tr-md rounded-bl-md font-semibold capitalize flex items-center justify-center ${
                  item.status === "not pay"
                    ? "bg-yellow-50 text-yellow-600"
                    : item.status === "onproses"
                    ? "bg-green-50 text-green-600"
                    : item.status === "success"
                    ? "bg-blue-50 text-blue-600"
                    : item.status === "failed"
                    ? "bg-red-50 text-red-600"
                    : ""
                }`}
              >
                {item.status}
              </div>

              {/* Outlet & Customer */}
              <div className="mt-10">
                <p className="text-sm text-gray-500">{item.by_name}</p>
              </div>

              {/* Pesanan */}
              <div className="mt-2 bg-gray-50 rounded p-2">
                <p className="font-semibold text-sm mb-1 text-gray-800">
                  Order:
                </p>
                {item.Orders.map((order) => (
                  <div key={order.id} className="mb-1 text-sm">
                    <div className="flex justify-between">
                      <p>{order.Menu.title}</p>
                      <p>{formatIDR(order.total_price)}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.qty} x {formatIDR(order.Menu.price)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end font-bold text-sm mt-1 p-2">
                <p>{formatIDR(item.total_pay)}</p>
              </div>
              <button
                onClick={closeModal}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
              >
                Close
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardOrder;
