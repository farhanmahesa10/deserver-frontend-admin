"use client";

import axios from "axios";
import Pagination from "./component/paginate/paginate";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { getNewAccessToken } from "./component/token/refreshToken";
import { Toaster, toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { IoSearch, IoTrash, IoPrint } from "react-icons/io5";
import { AiFillEdit } from "react-icons/ai";
import Layout2 from "./component/layout/layout2";
import { NotData } from "./component/notData/notData";
import { TableSkeleton } from "./component/skeleton/adminSkeleton";
import { handleApiError } from "./component/handleError/handleError";
import InputSearch from "./component/form/inputSearch";

export default function Transaction() {
  const [transaction, setTransaction] = useState([]);
  const [outletName, setOutletName] = useState("");
  const [role, setRole] = useState("");
  const [idOtlet, setIdOtlet] = useState("");
  const [orders, setOrders] = useState([]);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [by_name, setQueryByName] = useState("");
  const [printData, setPrintData] = useState("");
  const [searchQuery, setSearchQuery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  //use state untuk pagination
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 5 item per halaman
  const targetRef = useRef(null);

  // Menghitung indeks awal dan akhir untuk menampilkan nomber
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Data yang disimpan dalam state
  //set untuk page yg di tampilkan
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          setOutletName(data.outlet_name);
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

  useEffect(() => {
    if (idOtlet) {
      const socket = io("http://localhost:3000", {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
      // Bergabung ke outlet tertentu

      socket.emit("joinCafe", idOtlet);

      // Menerima pesan pesanan baru
      socket.on("newOrder", (orderData) => {
        if (orderData) {
          toast.success("Successfully toasted!");
        }

        setOrders((prevOrders) => [...prevOrders, orderData]);
      });

      // Membersihkan listener saat komponen unmount
      return () => {
        socket.off("newOrder");
      };
    }
  }, [idOtlet]);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(transaction);
  }, [transaction]);

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
      search: role == "user" ? outletName : query,
      by_name: by_name,
    };
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/transaction/showpaginated`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;
      setTransaction(data);
      setRows(response.data.totalItems);
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
        await fetchDataPaginated();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Pastikan loading dihentikan
      }
    };

    loadData();
  }, [itemsPerPage, currentPage, role, outletName]);

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
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/transaction/delete/${dataRemove}`,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        await fetchData("showpaginated");
        setIsLoading(false);
      }
    } catch (error) {
      await handleError(error);
    }
  };

  const handleUpdate = async (dataUdate, boolean) => {
    const savedToken = localStorage.getItem("token");
    const best = {
      status: boolean,
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
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/transaction/update/${dataUdate}`,
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

  //function mengubah angka menjadi IDR
  const formatIDR = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  //function format tanggal
  function formatTanggal(isoString) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() dimulai dari 0
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  //handle close modal
  const closeModal = () => {
    setPrintData("");
  };

  //handle close gambar besar
  const closeModalOrder = (id_transaction) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id_transaction !== id_transaction)
    );
  };

  return (
    <div ref={targetRef} className="   pb-8 w-full ">
      <div className="flex container">
        <Layout2 />
        <div className="pl-5 pt-20 pb-8 w-full bg-white border-l-2">
          <Toaster position="top-center" reverseOrder={false} />
          <h1 className="my-2 md:my-5 font-ubuntu font-semibold text-darkgray text-lg md:text-xl">
            Transaction Data Settings
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
              isLoading={isLoading}
              inputLeft={true}
              typeLeft={"text"}
              placeholderLeft={"Name Transaction. . ."}
              idLeft={"by_name"}
              valueLeft={by_name}
              onchangeLeft={(e) => setQueryByName(e.target.value)}
            />
          </div>

          <div className="rounded-lg  bg-white overflow-x-auto ">
            <div className="min-w-full">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <div className="text-gray-700 flex flex-wrap gap-2">
                  {searchQuery &&
                    searchQuery.map((item, index) => {
                      const number = indexOfFirstItem + index + 1;

                      return (
                        <div
                          key={item.id}
                          className="bg-white shadow-md rounded-lg p-2 w-[222px] border border-gray-300 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                        >
                          <div className="flex flex-col gap-1 flex-grow">
                            <h2 className="text-xl text-gray-800 text-center font-ubuntu font-semibold">
                              {item.Outlet.outlet_name}
                            </h2>
                            <div className="flex flex-col text-gray-700">
                              <p className="text-md">
                                <span className="font-semibold text-sm">
                                  Pelanggan:
                                </span>{" "}
                                {highlightText(item.by_name, by_name)}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">No Meja:</span>{" "}
                                {item.id_table}
                              </p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-2">
                              <p className="font-semibold text-sm text-gray-800">
                                Pesanan:
                              </p>
                              {item.Orders.map((order) => (
                                <div key={order.id} className="mb-1">
                                  <div className="flex justify-between text-sm">
                                    <p>{order.Menu.title}</p>
                                    <p>{formatIDR(order.total_price)}</p>
                                  </div>
                                  <p className="text-sm">
                                    {order.qty} x {formatIDR(order.Menu.price)}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between font-bold text-sm">
                              <p>Total</p>
                              <p>{formatIDR(item.total_pay)}</p>
                            </div>
                          </div>
                          <button
                            className="bg-gray-800 text-white text-sm rounded-lg py-2 w-full hover:bg-gray-700 transition-colors duration-300 mt-2"
                            onClick={() =>
                              handleUpdate(
                                item.id,
                                item.status === "not yet paid"
                                  ? "lunas"
                                  : "not yet paid"
                              )
                            }
                          >
                            {item.status === "not yet paid"
                              ? "Belum Bayar"
                              : "Lunas"}
                          </button>
                          <div className="flex justify-between mt-2">
                            <a
                              href={`/admin/transaction/edit?id=${item.id}`}
                              onClick={() => {
                                localStorage.setItem("id_transaction", item.id);
                                localStorage.setItem(
                                  "outlet_name",
                                  item.outlet.outlet_name
                                );
                              }}
                              className="text-sm text-white p-1 rounded-sm bg-blue-500"
                            >
                              <AiFillEdit />
                            </a>
                            <button
                              className="text-sm text-white p-1 rounded-sm bg-gray-600 "
                              onClick={() => setPrintData([item])}
                            >
                              <IoPrint />
                            </button>
                            <button
                              className=" text-sm text-white p-1 rounded-sm bg-red-600"
                              onClick={() => handleRemove(item.id)}
                            >
                              <IoTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              <div className="text-gray-700 font-nunitoSans">
                {orders &&
                  orders
                    .slice()
                    .reverse()
                    .map((item, index) => {
                      const number = index + 1;

                      return (
                        <div
                          key={item.id_transaction}
                          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
                        >
                          <div className="bg-white shadow-md rounded-lg p-2 w-[222px] border border-gray-300 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
                            <div className="flex flex-col gap-1 flex-grow">
                              <h2 className="text-xl font-bold text-gray-800 text-center">
                                {item.outlet_name}
                              </h2>
                              <div className="flex flex-col text-gray-700">
                                <p className="text-md">
                                  <span className="font-semibold text-sm">
                                    Pelanggan:
                                  </span>{" "}
                                  {item.by_name}
                                </p>
                                <p className="text-sm">
                                  <span className="font-semibold">
                                    No Meja:
                                  </span>{" "}
                                  {item.table.number_table}
                                </p>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-2">
                                <p className="font-semibold text-sm text-gray-800">
                                  Pesanan:
                                </p>
                                {item.orders.map((order) => (
                                  <div key={order.menu.title} className="mb-1">
                                    <div className="flex justify-between text-sm">
                                      <p>{order.menu.title}</p>
                                      <p>{formatIDR(order.total_price)}</p>
                                    </div>
                                    <p className="text-sm">
                                      {order.qty} x{" "}
                                      {formatIDR(order.menu.price)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between font-bold text-sm">
                                <p>Total</p>
                                <p>{formatIDR(item.total_pay)}</p>
                              </div>
                            </div>
                            <button
                              className="bg-gray-800 text-white text-sm rounded-lg py-2 w-full hover:bg-gray-700 transition-colors duration-300 mt-2"
                              onClick={() =>
                                handleUpdate(
                                  item.id_transaction,
                                  item.status === "not yet paid"
                                    ? "lunas"
                                    : "not yet paid"
                                )
                              }
                            >
                              {item.status === "not yet paid"
                                ? "Belum Bayar"
                                : "Lunas"}
                            </button>
                            <div className="flex justify-between mt-2">
                              <a
                                href={`/admin/transaction/edit?id=${item.id_transaction}`}
                                onClick={() => {
                                  localStorage.setItem(
                                    "id_transaction",
                                    item.id_transaction
                                  );
                                  localStorage.setItem(
                                    "outlet_name",
                                    item.outlet_name
                                  );
                                }}
                                className="text-sm text-white p-1 rounded-sm bg-blue-500"
                              >
                                <AiFillEdit />
                              </a>
                              <button
                                className="text-sm text-white p-1 rounded-sm bg-gray-600 "
                                onClick={() => setPrintData([item])}
                              >
                                <IoPrint />
                              </button>
                              <button
                                className=" text-sm text-white p-1 rounded-sm bg-red-600"
                                onClick={() =>
                                  handleRemove(item.id_transaction)
                                }
                              >
                                <IoTrash />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => closeModalOrder(item.id_transaction)}
                            className="absolute top-6 h-8 w-8 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full right-10 text-red-600 text-2xl flex items-center justify-center"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>

          {/* Tampilkan navigasi pagination */}
          {searchQuery.length > 0 && (
            <Pagination
              itemsPerPage={itemsPerPage}
              rows={rows}
              paginate={paginate}
              currentPage={currentPage}
            />
          )}

          {/* Tampilkan pesan data kosong jika tidak ada data */}
          {isLoading === false && searchQuery.length === 0 && <NotData />}
        </div>

        {printData &&
          printData.map((item) => {
            return (
              <div
                key={item.id}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
              >
                <div className="max-w-sm  p-4  bg-white shadow-md rounded-md font-mono text-sm">
                  <div className="flex justify-center ">
                    <div className="flex p-1 w-14 h-10">
                      {/* Ganti placeholder dengan logo jika ada */}
                      {item.outlet.profile.logo ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_BASE_API_URL}/${item.outlet.profile.logo}`}
                          className="w-full h-full object-contain"
                          alt="Logo"
                        />
                      ) : (
                        <h1 className=" text-xl  text-yellow-700 font-pacifico">
                          {item.outlet.profile.cafe_name}
                        </h1>
                      )}
                    </div>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg w-full text-center">
                      {item.outlet.outlet_name}
                    </h1>
                    <p className="text-center">{item.outlet.profile.address}</p>
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  <div className="flex justify-between">
                    <p className="w-20">{formatTanggal(item.updatedAt)}</p>
                    <p className="w-24 text-end">{item.by_name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>No.{item.table.number_table}</p>
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  {item.orders.map((order) => (
                    <div key={order.id} className="mb-1">
                      <div className="flex justify-between text-sm">
                        <p>{order.menu.title}</p>
                        <p>{formatIDR(order.total_price)}</p>
                      </div>
                      <p className="text-sm">
                        {order.qty} x {formatIDR(order.menu.price)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t border-dashed my-2"></div>

                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>{formatIDR(item.total_pay)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Bayar ({item.pays_method})</p>
                    <p>{formatIDR(item.total_pay)}</p>
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  <div>
                    <p className="text-center">- Thank You -</p>

                    {item.outlet.contacts.map((contact) => {
                      return (
                        <div key={contact.id} className="flex text-xs">
                          <p className="w-20  ">{contact.contact_name}</p>
                          <p>: {contact.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className=" -mt-96 ml-10 h-8 pb-4 w-8 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full  text-red-600 text-2xl flex text-center justify-center"
                >
                  &times;
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
