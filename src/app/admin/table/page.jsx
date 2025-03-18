"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

import { getNewAccessToken } from "../../component/token/refreshToken";
import Pagination from "../../component/paginate/paginate";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { NotData } from "@/app/component/notData/notData";

export default function Table() {
  const [table, setTable] = useState([]);
  const [outletName, setOutletName] = useState("");
  const [role, setRole] = useState("");
  const [idOutlet, setIdOutlet] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    id_outlet: "",
    number_table: "",
  });

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
    setSearchQuery(table);
  }, [table]);

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
          `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/showpaginated`,
          {
            params: params,
          }
        );

        const data = response.data.data;
        setTable(data);
        setRows(response.data.pagination.totalItems);
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
        `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/showpaginated`,
        {
          params: params,
        }
      );

      const data = response.data.data;
      setTable(data);
      setRows(response.data.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  //useEffect mengambil data table
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

  //function mengambil data table
  const fetchData = async () => {
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/showcafename/${outletName}`
      );

      const data = response.data.data;

      setTable(data);
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
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/delete/${dataRemove}`,
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

  const handleOpenModal = (
    data = { id: "", id_outlet: idOutlet, number_table: "" }
  ) => {
    setFormData(data);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ id: "", id_outlet: "", number_table: "" });
  };
  console.log(formData);

  //handle edit dan create
  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!table.number_table) {
    //   alert("Harap isi semua field!");
    //   return;
    // }

    // const formData = {
    //   id_outlet: table.id_outlet,
    //   number_table: table.number_table,
    // };

    const handleError = async (error) => {
      if (error.response?.status === 401) {
        try {
          const newToken = await getNewAccessToken();
          localStorage.setItem("token", newToken); // Simpan token baru
          await handleSubmit(e); // Ulangi proses dengan token baru
        } catch (err) {
          console.error("Failed to refresh token:", err);
          alert("Session Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          router.push("/login");
        }
      } else {
        console.error("Error deleting table:", error);
      }
    };

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formData.id) {
        // setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/update/${formData.id}`,
          formData,
          { headers }
        );
        localStorage.removeItem("id_table");
        alert("Data berhasil diperbarui!");
      } else {
        // setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/create`,
          formData,
          { headers }
        );
        alert("Data berhasil ditambahkan!");
      }

      router.push("/admin/table");
      // setLoadingButton(false);
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
        table Data Settings
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

        <button
          className={` bg-yellow-700 text-white body-text-sm-bold font-nunitoSans px-4 py-2 md:px-5 md:py-3 rounded-md shadow-md hover:bg-yellow-700 transition-all duration-300`}
          onClick={() => handleOpenModal()}
        >
          <IoMedkit />
        </button>
      </div>

      <div className="rounded-lg shadow-lg bg-white overflow-x-auto ">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-yellow-700 body-text-sm-bold font-nunitoSans">
              <tr>
                <th className="px-4 py-3 ">No</th>
                <th className="px-4 py-3">outlet Name</th>
                <th className="px-4 py-3">Number Room</th>
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
                        {role !== "admin" ? number : numberPaginate}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {editRowId === item.id ? (
                          <input
                            type="text"
                            value={formData.outlet_name}
                            className="border p-2 w-full"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                outlet_name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          item.Outlet.outlet_name
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {editRowId === item.id ? (
                          <input
                            type="text"
                            value={formData.number_table}
                            className="border p-2 w-full"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                number_table: e.target.value,
                              })
                            }
                          />
                        ) : (
                          item.number_table
                        )}
                      </td>

                      <td className="px-4 py-3 flex justify-center gap-2 text-center">
                        {editRowId === item.id ? (
                          <>
                            <button
                              onClick={handleSubmit}
                              className="bg-green-500 text-white p-1 rounded-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditRowId(null)}
                              className="bg-gray-500 text-white p-1 rounded-sm"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditRowId(item.id);
                                setFormData({
                                  id: item.id,
                                  id_outlet: item.id_outlet,
                                  outlet_name: item.Outlet.outlet_name,
                                  number_table: item.number_table,
                                });
                              }}
                              className="text-sm text-white p-1 rounded-sm bg-blue-500"
                            >
                              <AiFillEdit />
                            </button>
                            <button
                              className="text-sm text-white p-1 rounded-sm bg-red-500"
                              onClick={() => handleRemove(item.id)}
                            >
                              <IoTrash />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
        {modalOpen && (
          <div className="modal">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={formData.number_table}
                onChange={(e) =>
                  setFormData({ ...formData, number_table: e.target.value })
                }
                placeholder="Enter Table Number"
              />
              <div className="flex gap-4">
                <button type="submit">Save</button>
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
