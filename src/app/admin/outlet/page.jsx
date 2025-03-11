"use client";

import axios from "axios";
import Pagination from "../../component/paginate/paginate";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getNewAccessToken } from "../../component/refreshToken/refreshToken";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";
import {
  IconSkeleton,
  SearchSkeleton,
  TableSkeleton,
} from "../../component/skeleton/adminSkeleton";
import { NotData } from "@/app/component/notData/notData";

export default function AdminOutlet() {
  const [outlet, setOutlet] = useState([]);
  const [role, setRole] = useState("");
  const [outletId, setOutletId] = useState("");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // cek token
  useEffect(() => {
    const savedToken = localStorage.getItem("refreshToken");

    if (savedToken) {
      const decoded = jwtDecode(savedToken);
      const outlet_id = decoded.id;
      setOutletId(outlet_id);
      const expirationTime = new Date(decoded.exp * 1000);
      const currentTime = new Date();

      if (currentTime > expirationTime) {
        localStorage.removeItem("refreshToken");
        router.push(`/login`);
      } else {
        axios
          .get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outlet_id}`
          )
          .then((response) => {
            const data = response.data.data;
            if (data.role !== "admin") {
              router.push("/admin");
            }
            setRole(data.role);
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  //setiap kali ada perubahan di current page maka scroll ke atas
  useEffect(() => {
    targetRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

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

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(outlet);
  }, [outlet]);

  //handle pencarian
  const searchData = () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    setCurrentPage(1);
    const fetchData = async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: query,
      };
      try {
        // Mengambil data transaksi menggunakan axios dengan query params
        const response = await axios.get(
          `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/showpaginated`,
          {
            params: params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data;
        setOutlet(data);
        setRows(response.data.pagination.totalItems);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };
    setIsLoading(false);

    fetchData();
  };

  console.log(outlet);

  // function mengambil data lapangan by limit
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: query,
    };
    try {
      const response = await axios.get(
        `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/showpaginated`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;
      setOutlet(data);
      setRows(response.data.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  // useEffect mengambil data lapangan by limit
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Tampilkan loading
      try {
        if (role === "admin") {
          await fetchData();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Matikan loading setelah operasi selesai (berhasil/gagal)
      }
    };

    if (role) {
      loadData();
    }
  }, [itemsPerPage, currentPage, role]);

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
        console.error("Error deleting contact:", error);
      }
    };

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/delete/${dataRemove}`,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        await fetchData();
        setIsLoading(false);
      }
    } catch (error) {
      await handleError(error);
    }
  };

  console.log(searchQuery);

  return (
    <div
      ref={targetRef}
      className=" pl-5 pt-20 pb-8 w-full bg-white overflow-auto border-l-2"
    >
      <>
        <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold text-lg md:text-xl">
          Outlet Data Settings
        </h1>
        <div
          className={`flex flex-wrap justify-between items-center lg:w-full gap-4 md:gap-6 w-full mb-6 `}
        >
          <div className="flex gap-3 items-center ">
            {isLoading ? (
              <SearchSkeleton />
            ) : (
              <input
                type="text"
                placeholder="Outlet Nama. . ."
                id="search"
                className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] w-[200px] md:w-[300px] text-gray-700 body-text-sm md:body-text-base font-poppins border border-gray-300 focus:outline-primary50 rounded-md shadow-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            )}
            {isLoading ? (
              <IconSkeleton />
            ) : (
              <button
                onClick={searchData}
                className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] bg-yellow-700 text-white text-xl font-nunitoSans rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300"
              >
                <IoSearch />
              </button>
            )}
          </div>

          {isLoading ? (
            <IconSkeleton />
          ) : (
            <a
              className={` bg-yellow-700 body-text-sm-bold text-white font-nunitoSans px-4 py-2 md:px-5 md:py-3 rounded-md shadow-md hover:bg-yellow-700 transition-all duration-300`}
              href="/admin/outlet/create"
            >
              <IoMedkit />
            </a>
          )}
        </div>

        <div className="rounded-lg shadow-lg bg-white overflow-x-auto ">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="bg-yellow-700 body-text-sm-bold font-nunitoSans">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Outlet Name</th>
                  <th className="px-4 py-3">email</th>
                  <th className="px-4 py-3">role</th>
                  <th className="px-4 py-3">history</th>
                  <th className="px-4 py-3">address</th>
                  <th className="px-4 py-3">logo</th>
                  <th className="px-4 py-3">action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 font-nunitoSans">
                {searchQuery &&
                  searchQuery.map((item, index) => {
                    const number = indexOfFirstItem + index + 1;
                    const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.logo}`;

                    return (
                      <tr
                        key={number}
                        className="hover:bg-gray-100 transition-all duration-300 border-b-2"
                      >
                        <td className="px-4 py-3 text-center">{number}</td>
                        <td className="px-4 py-3">
                          {highlightText(item.outlet_name, query)}
                        </td>
                        <td className="px-4 py-3 ">{item.email}</td>
                        <td className="px-4 py-3">{item.role}</td>
                        <td className="px-4 py-3">{item.history}</td>
                        <td className="px-4 py-3">{item.address}</td>
                        <td className="px-4 py-3 ">
                          <img
                            src={item.logo ? imageUrl : "-"}
                            alt="Bukti Pembayaran"
                            className="w-12 h-12 rounded-md shadow-md cursor-pointer mx-auto"
                            onClick={() => handleImageClick(imageUrl)}
                          />
                        </td>

                        <td className="px-4 py-3 flex justify-center gap-2 text-center">
                          <a
                            href={`/admin/outlet/edit?id=${item.id}`}
                            onClick={() =>
                              localStorage.setItem("id_outlet", item.id)
                            }
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
        </div>

        {/* Tampilkan navigasi pagination */}
        {searchQuery.length > 0 && (
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
      </>
    </div>
  );
}
