"use client";

import React from "react";

const Pagination = ({ itemsPerPage, paginate, rows, currentPage }) => {
  const totalPages = Math.ceil(rows / itemsPerPage);

  const handleKurang = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

  const handleTambah = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    let pageNumbers = [];

    if (totalPages <= 8) {
      pageNumbers = [...Array(totalPages).keys()].map((n) => n + 1);
    } else {
      if (currentPage <= 3) {
        pageNumbers = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pageNumbers = [
          1,
          "...",

          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pageNumbers = [
          1,
          "...",
          currentPage - 2,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }
    return pageNumbers;
  };

  return (
    <nav className="mt-5">
      <ul className="flex justify-center gap-2">
        <li>
          <button
            onClick={handleKurang}
            className={`${
              currentPage === 1 ? "hidden" : ""
            } p-1 w-8 h-8 border rounded bg-gray-200 hover:bg-gray-300`}
          >
            <img src="/img/arah.png" alt="person" className="w-full h-full" />
          </button>
        </li>
        {renderPageNumbers().map((number, index) => (
          <li
            key={index}
            onClick={() => {
              if (number !== "...") {
                paginate(number);
              }
            }}
            className={`${
              currentPage === number
                ? "bg-yellow-700 text-white"
                : "bg-gray-200"
            } w-8 h-8 flex items-center justify-center rounded cursor-pointer`}
          >
            {number}
          </li>
        ))}
        <li>
          <button
            onClick={handleTambah}
            className={`${
              currentPage === totalPages ? "hidden" : ""
            } p-1 w-8 h-8 border rounded bg-gray-200 hover:bg-gray-300`}
          >
            <img src="/img/arah.png" alt="person" className="rotate-180" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
