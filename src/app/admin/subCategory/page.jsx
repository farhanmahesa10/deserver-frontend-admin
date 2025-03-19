"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Modal from "../../component/modal/modal";
import { getNewAccessToken } from "../../component/token/refreshToken";
import Pagination from "../../component/paginate/paginate";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { NotData } from "@/app/component/notData/notData";
import { handleApiError } from "@/app/component/handleError/handleError";
import { Toaster, toast } from "react-hot-toast";

export default function subCategory() {
  const [subCategory, setSubCategory] = useState([]);
  const [outletName, setOutletName] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState([]);
  const [query, setQuery] = useState("");

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

  //cek token
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
    setSearchQuery(subCategory);
  }, [subCategory]);

  // function mengambil data lapangan by limit
  const fetchDataPaginated = async (isSearchMode = false) => {
    setIsLoading(true);
    if (isSearchMode) {
      setCurrentPage(1); // Reset ke page 1 jika pencarian
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
        `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/showpaginated`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;
      setSubCategory(data);
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

  //useEffect mengambil data Category
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Tampilkan loading
      try {
        await fetchDataPaginated();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Pastikan loading dihentikan
      }
    };

    if (role) {
      loadData();
    }
  }, [itemsPerPage, currentPage, role]);

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

  //handle untuk menghapus data
  const handleRemove = async (dataRemove) => {
    const savedToken = localStorage.getItem("token");

    const handleError = async (error) => {
      if (error.response?.status === 401) {
        try {
          const newToken = await getNewAccessToken();
          localStorage.setItem("token", newToken); // Simpan token baru
          await handleRemove(dataRemove); // Ulangi proses dengan token baru
        } catch (err) {
          console.error("Failed to refresh token:", err);
          alert("Session Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          router.push("/login");
        }
      } else {
        console.error("Error deleting subCategory:", error);
      }
    };

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/delete/${dataRemove}`,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        await fetchDataPaginated();

        setIsLoading(false);
      }
    } catch (error) {
      await handleError(error);
    }
  };

  return (
    <div
      ref={targetRef}
      className=" pl-5 pt-20 pb-8 w-full bg-white overflow-auto border-l-2"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold text-lg md:text-xl">
        Sub Category Data Setting
      </h1>
      <div
        className={`flex flex-wrap justify-between items-center lg:w-full gap-4 md:gap-6 w-full mb-6`}
      >
        <div
          className={`${
            role == "admin" ? "flex" : "hidden"
          } flex gap-3 items-center`}
        >
          <input
            type="text"
            placeholder="Outlet Name. . ."
            id="search"
            className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] w-[200px] md:w-[300px] text-gray-700 body-text-sm md:body-text-base font-poppins border border-gray-300 focus:outline-primary50 rounded-md shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => fetchDataPaginated(true)}
            className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] bg-yellow-700 text-white text-xl font-nunitoSans rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300"
          >
            <IoSearch />
          </button>
        </div>

        <a
          className={` bg-yellow-700 text-white body-text-sm-bold font-nunitoSans px-4 py-2 md:px-5 md:py-3 rounded-md shadow-md hover:bg-yellow-700 transition-all duration-300`}
          href="/admin/subCategory/create"
        >
          <IoMedkit />
        </a>
      </div>
      <div className="rounded-lg shadow-lg bg-white overflow-x-auto ">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-yellow-700  body-text-sm-bold font-nunitoSans">
              <tr>
                <th className="px-4 py-3 ">No</th>
                <th className="px-4 py-3 ">Outlet Name</th>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 font-nunitoSans">
              {searchQuery &&
                searchQuery.map((item, index) => {
                  const number = index + 1;
                  const numberPaginate = indexOfFirstItem + index + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition-all duration-300 border-b-2"
                    >
                      <td className="px-4 py-3 text-center">
                        {" "}
                        {role !== "admin" ? number : numberPaginate}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {highlightText(item.Category.Outlet.outlet_name, query)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.Category.type}
                      </td>
                      <td className="px-4 py-3 text-center">{item.title}</td>
                      <td className="px-4 py-3 flex justify-center gap-2 text-center">
                        <a
                          href={`/admin/subCategory/edit?id=${item.id}`}
                          onClick={() => {
                            localStorage.setItem("id_subCategory", item.id);
                            localStorage.setItem(
                              "outlet_name",
                              item.Category.Outlet.outlet_name
                            );
                          }}
                          className="text-sm text-white p-1 rounded-sm bg-blue-500"
                        >
                          <AiFillEdit />
                        </a>
                        <button
                          className="text-sm text-white p-1 rounded-sm bg-red-500"
                          onClick={() => handleRemove(item.id)}
                        >
                          <IoTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
        {/* Modal */}
        {isModalOpen && (
          <Modal
            currentImage={currentImage}
            setIsModalOpen={setIsModalOpen}
            setCurrentImage={setCurrentImage}
          />
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

      {/* Tampilkan pesan data kosong jika tidak ada data */}
      {isLoading === false && searchQuery.length === 0 && <NotData />}
    </div>
  );
}
