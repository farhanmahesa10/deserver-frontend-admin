"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Pagination from "../../component/paginate/paginate";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { NotData } from "@/app/component/notData/notData";
import { handleApiError } from "@/app/component/handleError/handleError";
import { Toaster, toast } from "react-hot-toast";
import HanldeRemove from "@/app/component/handleRemove/handleRemove";
import InputSearch from "@/app/component/form/inputSearch";

export default function Category() {
  const [category, setCategory] = useState([]);
  const [role, setRole] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState([]);
  const [query, setQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataToRemove, setDataToRemove] = useState(null);

  //use state untuk pagination
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 item per halaman
  const targetRef = useRef(null);

  // Menghitung indeks awal dan akhir untuk menampilkan nomber
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Data yang disimpan dalam state
  //set untuk page yg di tampilkan
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //toast data baru
  useEffect(() => {
    const newData = localStorage.getItem("newData");
    if (newData) {
      toast.success(newData);
      localStorage.removeItem("newData");
    }
  }, []);

  // cek token
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const refreshToken = localStorage.getItem("refreshToken");
      const token = localStorage.getItem("token");
      if (refreshToken) {
        const decoded = jwtDecode(refreshToken);
        const outlet_id = decoded.id;
        const expirationTime = new Date(decoded.exp * 1000);
        const currentTime = new Date();

        if (currentTime > expirationTime) {
          localStorage.clear();
          router.push(`/login`);
        }

        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outlet_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = response.data.data;

          setRole(data.role);
          setIsLoading(false);
        } catch (error) {
          await handleApiError(error, loadData, router);
        }
      } else {
        router.push(`/login`);
      }
    };

    loadData();
  }, []);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(category);
  }, [category]);

  // function mengambil data lapangan by limit
  const fetchDataPaginated = async (isSearchMode = false) => {
    setIsLoading(true);
    if (isSearchMode) {
      setCurrentPage(1);
    }
    const token = localStorage.getItem("token");

    const params = {
      page: isSearchMode ? 1 : currentPage,
      limit: itemsPerPage,
      search: query,
    };
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/category/showpaginated`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;
      setCategory(data);
      setRows(response.data.pagination.totalItems);
      setIsLoading(false);
    } catch (error) {
      await handleApiError(
        error,
        () => fetchDataPaginated(isSearchMode),
        router
      );
    }
  };

  //useEffect mengambil data category
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDataPaginated();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [itemsPerPage, currentPage]);

  //handle untuk menghapus data
  const handleRemove = async () => {
    const savedToken = localStorage.getItem("token");

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/category/delete/${dataToRemove}`,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        await fetchDataPaginated();
        setShowConfirmModal(false);
        setIsLoading(false);
      }
    } catch (error) {
      await handleApiError(error, handleRemove, router);
    }
  };

  const confirmRemove = (dataRemove) => {
    setDataToRemove(dataRemove);
    setShowConfirmModal(true);
  };

  //stabilo pencarian
  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi"); // Cari query (case-insensitive)
    const parts = text.split(regex); // Pisah teks berdasarkan query

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-green-500">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={targetRef}
      className=" pl-5 pt-20 pb-8 w-full bg-white overflow-auto border-l-2"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold text-lg md:text-xl">
        Category Data Settings
      </h1>
      <div>
        <InputSearch
          role={role}
          type="text"
          placeholder="Outlet Name. . ."
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onRightButtonCLick={() => fetchDataPaginated(true)}
          rightButton={<IoSearch />}
          createData={<IoMedkit />}
          linkCreate={"/admin/category/create"}
          isLoading={isLoading}
        />
      </div>

      <div className="rounded-lg shadow-lg bg-white overflow-x-auto ">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-yellow-700 body-text-sm-bold font-nunitoSans text-white">
              <tr>
                <th className="px-4 py-3 ">No</th>
                <th className="px-4 py-3">Outlet Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Descriptions</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 font-nunitoSans">
              {isLoading ? null : searchQuery.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center">
                    <NotData />
                  </td>
                </tr>
              ) : (
                searchQuery.map((item, index) => {
                  const number = index + 1;
                  const numberPaginate = indexOfFirstItem + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition-all duration-300 border-b-2"
                    >
                      <td className="px-4 py-3 text-center">
                        {role !== "admin" ? number : numberPaginate}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {highlightText(item.Outlet.outlet_name, query)}
                      </td>
                      <td className="px-4 py-3 text-center">{item.type}</td>
                      <td className="px-4 py-3 text-center">
                        {item.descriptions}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-2 text-center">
                        <a
                          href={`/admin/category/edit?id=${item.id}`}
                          onClick={() =>
                            localStorage.setItem("id_category", item.id)
                          }
                          className="text-sm text-white p-1 rounded-sm bg-blue-500"
                        >
                          <AiFillEdit />
                        </a>
                        <button
                          className="text-sm text-white p-1 rounded-sm bg-red-500"
                          onClick={() => confirmRemove(item.id)}
                        >
                          <IoTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Tampilkan navigasi pagination */}
      {searchQuery && searchQuery.length > 0 && (
        <Pagination
          itemsPerPage={itemsPerPage}
          rows={rows}
          paginate={paginate}
          currentPage={currentPage}
          isLoading={isLoading}
        />
      )}

      {/* modal konfirmasi delete */}
      {showConfirmModal && (
        <HanldeRemove
          handleRemove={handleRemove}
          setShowConfirmModal={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
