"use client";

import axios from "axios";
import Pagination from "../../component/paginate/paginate";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Modal from "../../component/modal/modal";
import { getNewAccessToken } from "../../component/token/refreshToken";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { NotData } from "@/app/component/notData/notData";
import { handleApiError } from "@/app/component/handleError/handleError";
import { Toaster, toast } from "react-hot-toast";
import HanldeRemove from "@/app/component/handleRemove/handleRemove";
import InputSearch from "@/app/component/form/inputSearch";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [role, setRole] = useState("");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [queryMenu, setQueryMenu] = useState("");
  const [searchQuery, setSearchQuery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataToRemove, setDataToRemove] = useState(null);

  //use state untuk pagination
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // 5 item per halaman
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

  //setiap kali ada perubahan di current page maka scroll ke atas
  useEffect(() => {
    targetRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(menu);
  }, [menu]);

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
      search_title: queryMenu,
    };
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/menu/showpaginated`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;
      setMenu(data);
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

  // useEffect mengambil data lapangan by limit
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Tampilkan loading
      try {
        if (role) {
          await fetchDataPaginated();
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

  //handle untuk menghapus data
  const handleRemove = async () => {
    const savedToken = localStorage.getItem("token");

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/menu/delete/${dataToRemove}`,
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

  const handleUpdate = async (dataUdate, boolean) => {
    const savedToken = localStorage.getItem("token");
    const best = {
      best_seller: boolean,
    };

    const handleError = async (error) => {
      if (error.response?.status === 401) {
        try {
          const newToken = await getNewAccessToken();
          localStorage.setItem("token", newToken); // Simpan token baru
          await handleUpdate(dataUdate, boolean); // Ulangi proses dengan token baru
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
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/menu/update/${dataUdate}`,
        best,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        if (role) {
          await fetchData();
        }
        setIsLoading(false);
      }
    } catch (error) {
      await handleError(error);
    }
  };
  const handleUpdateStok = async (idUpdate, stok) => {
    const savedToken = localStorage.getItem("token");
    const data = {
      status: stok,
    };

    const handleError = async (error) => {
      if (error.response?.status === 401) {
        try {
          const newToken = await getNewAccessToken();
          localStorage.setItem("token", newToken); // Simpan token baru
          await handleUpdateStok(idUpdate, stok); // Ulangi proses dengan token baru
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
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/menu/update/${idUpdate}`,
        data,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        if (role) {
          await fetchData();
        }
        setIsLoading(false);
      }
    } catch (error) {
      await handleError(error);
    }
  };

  // haldle untuk memperbesar gambar
  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl); // Menyimpan URL gambar yang diklik
    setIsModalOpen(true); // Membuka modal
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
        Menu Data Settings
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
          linkCreate={"/admin/menu/create"}
          isLoading={isLoading}
          inputLeft={true}
          typeLeft={"text"}
          placeholderLeft={"Menu Name. . ."}
          idLeft={"search_menu"}
          valueLeft={queryMenu}
          onchangeLeft={(e) => setQueryMenu(e.target.value)}
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
                <th className="px-4 py-3 ">Outlet Name</th>
                <th className="px-4 py-3">Sub Kategory Name</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Best Seller</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 font-nunitoSans">
              {isLoading ? null : searchQuery.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center">
                    <NotData />
                  </td>
                </tr>
              ) : (
                searchQuery.map((item, index) => {
                  const number = indexOfFirstItem + index + 1;
                  const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.photo}`;
                  return (
                    <tr
                      key={number}
                      className="hover:bg-gray-100 transition-all duration-300 border-b-2"
                    >
                      <td className="px-4 py-3 text-center">{number}</td>
                      <td className="px-4 py-3 text-center">
                        {highlightText(
                          item.SubCategory.Category.Outlet.outlet_name,
                          query
                        )}
                      </td>
                      <td className="px-4 py-3">{item.SubCategory.title}</td>
                      <td className="px-4 py-3">
                        {highlightText(item.title, queryMenu)}
                      </td>
                      <td className="px-4 py-3">{item.price}</td>
                      <td className="px-4 py-3">{item.details}</td>

                      <td className="px-4 py-3 ">
                        <img
                          src={item.photo ? imageUrl : "-"}
                          alt="Bukti Pembayaran"
                          className="w-12 h-12 rounded-md shadow-md cursor-pointer mx-auto"
                          onClick={() => handleImageClick(imageUrl)}
                        />
                      </td>

                      <td className="px-4 py-3">
                        {" "}
                        <button
                          className="bg-yellow-700 text-white rounded-lg p-2"
                          onClick={() =>
                            handleUpdateStok(
                              item.id,
                              item.status === "ready" ? "soldOut" : "ready"
                            )
                          }
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {" "}
                        <button
                          className="bg-yellow-700 text-white rounded-lg p-2"
                          onClick={() =>
                            handleUpdate(
                              item.id,
                              item.best_seller === true ? false : true
                            )
                          }
                        >
                          {item.best_seller === true ? "true" : "false"}
                        </button>
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-2 text-center">
                        <a
                          href={`/admin/menu/edit?id=${item.id}`}
                          onClick={() => {
                            localStorage.setItem("id_menu", item.id);
                            localStorage.setItem(
                              "outlet_name",
                              item.SubCategory.Category.Outlet.outlet_name
                            );
                          }}
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
      {searchQuery.length > 0 && (
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
