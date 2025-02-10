"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

import AdminSkeleton from "../adminSkeleton/adminSkeleton";
import { getNewAccessToken } from "../refreshToken";
import Pagination from "../paginate";
import Modal from "../modal";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [outletName, setOutletName] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

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
      const expirationTime = new Date(decoded.exp * 1000);
      const currentTime = new Date();

      if (currentTime > expirationTime) {
        localStorage.clear();
        router.push(`/login`);
      } else {
        axios
          .get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outlet_id}`
          )
          .then((response) => {
            const data = response.data;
            setOutletName(data.outlet_name);
            setRole(data.role);
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(gallery);
  }, [gallery]);

  //handle pencarian
  const searchData = () => {
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
          `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/showpaginated`,
          {
            params: params,
          }
        );

        const data = response.data.gallery;
        setGallery(data);
        setRows(response.data.totalItems);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };
    setIsLoading(false);

    fetchData();
  };

  // function mengambil data lapangan by limit
  const fetchDataPaginated = async () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: query,
    };
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/showpaginated`,
        {
          params: params,
        }
      );

      const data = response.data.gallery;
      setGallery(data);
      setRows(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  //useEffect mengambil data gallery
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Tampilkan loading
      try {
        if (role === "admin") {
          await fetchDataPaginated();
        } else {
          await fetchData();
        }
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

  //function mengambil data gallery
  const fetchData = async () => {
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/showcafename/${outletName}`
      );

      const data = response.data;

      setGallery(data);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
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
        console.error("Error deleting contact:", error);
      }
    };

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/delete/${dataRemove}`,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        if (role === "admin") {
          await fetchDataPaginated();
        } else {
          await fetchData();
        }
        setIsLoading(false);
      }
    } catch (error) {
      await handleError(error);
    }
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

  // haldle untuk memperbesar gambar
  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl); // Menyimpan URL gambar yang diklik
    setIsModalOpen(true); // Membuka modal
  };

  return (
    <div
      ref={targetRef}
      className=" pl-5 pt-20 pb-8 w-full bg-white overflow-auto border-l-2"
    >
      {isLoading ? (
        <AdminSkeleton />
      ) : (
        <>
          <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold text-lg md:text-xl">
            Gallery Data Settings
          </h1>
          <div
            className={`flex flex-wrap justify-between items-center lg:w-full gap-4 md:gap-6 w-full mb-6`}
          >
            <div
              className={`${
                role == "admin" ? "flex" : "hidden"
              }  gap-3 items-center`}
            >
              <input
                type="text"
                placeholder="outlet Name. . ."
                id="search"
                className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] w-[200px] md:w-[300px] text-gray-700 body-text-sm md:body-text-base font-poppins border border-gray-300 focus:outline-primary50 rounded-md shadow-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={searchData}
                className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] bg-yellow-700 text-white text-xl font-nunitoSans rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300"
              >
                <IoSearch />
              </button>
            </div>

            <a
              className={` bg-yellow-700 text-white body-text-sm-bold font-nunitoSans px-4 py-2 md:px-5 md:py-3 rounded-md shadow-md hover:bg-yellow-700 transition-all duration-300`}
              href="/admin/gallery/create"
            >
              <IoMedkit />
            </a>
          </div>

          <div className="rounded-lg shadow-lg bg-white overflow-x-auto ">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="bg-yellow-700 body-text-sm-bold font-nunitoSans">
                <tr>
                  <th className="px-4 py-3 ">No</th>
                  <th className="px-4 py-3">outlet Name</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 font-nunitoSans">
                {searchQuery &&
                  searchQuery.map((item, index) => {
                    const number = index + 1;
                    const numberPaginate = indexOfFirstItem + index + 1;
                    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}/${item.image}`;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-100 transition-all duration-300 border-b-2"
                      >
                        <td className="px-4 py-3 text-center">
                          {role !== "admin" ? number : numberPaginate}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {highlightText(item.outlet.outlet_name, query)}
                        </td>
                        <td className="px-4 py-3 text-center">{item.title}</td>
                        <td className="px-4 py-3  ">
                          <img
                            src={item.image ? imageUrl : "-"}
                            alt="Bukti Pembayaran"
                            className="w-12 h-12 rounded-md shadow-md cursor-pointer mx-auto"
                            onClick={() => handleImageClick(imageUrl)}
                          />
                        </td>

                        <td className="px-4 py-3 flex justify-center gap-2 text-center">
                          <a
                            href={`/admin/gallery/edit?id=${item.id}`}
                            onClick={() =>
                              localStorage.setItem("id_gallery", item.id)
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
            />
          )}

          {/* Tampilkan pesan data kosong jika tidak ada data */}
          {searchQuery && searchQuery.length === 0 && (
            <div className="flex justify-center mt-6">
              <p className="italic text-red-500 border-b border-red-500">
                Data tidak ditemukan!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
