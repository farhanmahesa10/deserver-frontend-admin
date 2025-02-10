"use client";

import React, { useState, useEffect } from "react";

const Pagination = ({ itemsPerPage, paginate, rows, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(rows / itemsPerPage); // Total halaman
  const [isActive, setIsActive] = useState(currentPage);
  for (let i = 1; i <= Math.ceil(rows / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    setIsActive(currentPage);
  }, [currentPage]);
  // Fungsi untuk mengurangi halaman
  const handleKurang = () => {
    if (isActive > 1) {
      const prevPage = isActive - 1;
      setIsActive(prevPage);
      paginate(prevPage);
    }
  };

  // Fungsi untuk menambah halaman
  const handleTambah = () => {
    if (isActive < totalPages) {
      const nextPage = isActive + 1;
      setIsActive(nextPage);
      paginate(nextPage);
    }
  };

  return (
    <nav className="mt-5">
      <ul className="flex justify-center gap-3">
        <li>
          <button
            onClick={handleKurang}
            className={`${
              pageNumbers.length <= 1 ? "hidden" : "block"
            } p-1  w-8 h-8 border rounded bg-gray-200 hover:bg-gray-300`}
            disabled={isActive === 1} // Nonaktifkan tombol jika di halaman pertama
          >
            <img src="/img/arah.png" alt="person" className="w-full h-full" />
          </button>
        </li>
        {/* Nomor Halaman */}
        {pageNumbers.map((number) => (
          <li
            key={number}
            onClick={() => {
              setIsActive(number);
              paginate(number);
            }}
            className={`${
              isActive === number ? "bg-slate-500 text-white" : "bg-gray-200"
            }  w-8 h-8 border-2 flex items-center justify-center rounded cursor-pointer`}
          >
            {number}
          </li>
        ))}

        <li>
          <button
            onClick={handleTambah}
            className={`${
              pageNumbers.length <= 1 ? "hidden" : "block"
            } p-1 w-8 h-8 border rounded bg-gray-200 hover:bg-gray-300`}
            disabled={isActive === totalPages} // Nonaktifkan tombol jika di halaman terakhir
          >
            <img src="/img/arah.png" alt="person" className="rotate-180" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
