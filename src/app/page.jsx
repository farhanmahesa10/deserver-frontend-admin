"use client";

import Pagination from "./component/paginate/paginate";
import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import Layout2 from "./component/layout/layout2";
import { NotData } from "./component/notData/notData";
import { TableSkeleton } from "./component/skeleton/adminSkeleton";
import InputSearch from "./component/form/inputSearch";
import { useDispatch, useSelector } from "react-redux";
import { addOrderNotif } from "@/store/slice";
import HanldeUpdateStatus from "./component/handleUpdate/updateStatus";
import CardRevenue from "./component/card/cardRevenue";
import { HighlightText } from "./component/utils/highlightText";
import { FormatIDR } from "./component/utils/formatIDR";
import { FormatDate } from "./component/utils/formatDate";
import instance from "./component/api/api";
import socket from "./component/socket/socketIo";
import AcceptOrder from "./component/button/acceptOrder";

export default function Transaction() {
  const [transaction, setTransaction] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderActive, setOrderActive] = useState([]);
  const [query, setQuery] = useState("");
  const [by_name, setQueryByName] = useState("");
  const [printData, setPrintData] = useState("");
  const [searchQuery, setSearchQuery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataUpdate, setDataUpdate] = useState([]);
  const [statusToUpdate, setStatusToUpdate] = useState([]);
  const [showConfirmModalUpdate, setShowConfirmModalUpdate] = useState(false);
  const dataOutlet = useSelector((state) => state.counter.outlet);
  const dispatch = useDispatch();

  //use state untuk pagination
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const targetRef = useRef(null);

  // Menghitung indeks awal dan akhir untuk menampilkan nomber
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Data yang disimpan dalam state
  //set untuk page yg di tampilkan
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //setiap kali ada perubahan di current page maka scroll ke atas
  useEffect(() => {
    targetRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

  //integrasi socket.io
  useEffect(() => {
    if (!dataOutlet?.id) return;

    // Bergabung ke outlet tertentu
    socket.emit("joinCafe", dataOutlet.id);

    // Menerima pesan pesanan baru
    socket.on("newOrder", (orderData) => {
      if (orderData) {
        toast.success("New Order!");
      }
      const newOrder = { ...orderData.data.payload, seen: false };
      dispatch(addOrderNotif(newOrder));
      setOrders((prevOrders) => [...prevOrders, orderData.data.payload]);
    });

    // Membersihkan listener saat komponen unmount
    return () => {
      socket.off("newOrder");
    };
  }, [dataOutlet?.id]);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(transaction);
  }, [transaction]);

  // function mengambil data lapangan by limit
  const fetchDataPaginated = async (isSearchMode = false) => {
    setIsLoading(true);

    const pageToFetch = isSearchMode ? 1 : currentPage;
    if (isSearchMode) {
      setCurrentPage(1); // Reset ke page 1 jika pencarian
    }

    const params = {
      page: pageToFetch,
      limit: itemsPerPage,
      search: dataOutlet.role == "admin" ? dataOutlet.outlet_name : query,
      by_name: by_name,
    };
    try {
      // Mengambil data transaksi menggunakan instance dengan query params
      const response = await instance.get(`/api/v1/transaction/showpaginated`, {
        params: params,
      });

      const data = response.data.data;
      const pagination = response.data.pagination;

      // Jika current page melebihi totalPages, set ulang currentPage saja
      if (
        !isSearchMode &&
        pagination.totalPages > 0 &&
        pageToFetch > pagination.totalPages
      ) {
        setCurrentPage(pagination.totalPages);
        return; // jangan lanjutkan render, tunggu useEffect panggil ulang
      }

      setTransaction(data);
      setRows(pagination.totalItems);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  //mengambil data active
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get(`/api/v1/grafik/info`);

        const data = response.data;
        setOrderActive(data.active + data.onprocess);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // useEffect mengambil data transaksi by limit
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
  }, [itemsPerPage, currentPage, dataOutlet.role, dataOutlet.outlet_name]);

  const handleUpdate = async () => {
    const status = {
      status: statusToUpdate,
    };

    const payload = {
      id: dataUpdate.id,
      id_outlet: dataOutlet.id,
      outletCode: dataOutlet.outlet_code,
      outlet_name: dataOutlet.outlet_name,
      by_name: dataUpdate.by_name,
      total_pay: dataUpdate.total_pay,
      status: statusToUpdate,
      date: new Date(),
      Table: {
        table_code: dataUpdate.Table.table_code,
        number_table: dataUpdate.Table.number_table,
      },
      Orders: dataUpdate.Orders,
    };
    console.log(payload);
    socket.emit("confirmOrderByAdmin", payload, async (socketResponse) => {
      if (socketResponse.status === "success") {
        try {
          setIsLoading(true);
          const apiResponse = await instance.put(
            `/api/v1/transaction/update/${dataUpdate.id}`,
            status
          );

          if (apiResponse.status === 200) {
            closeModalOrder(dataUpdate.id);
            await fetchDataPaginated();
            setShowConfirmModalUpdate(false);

            if (statusToUpdate === "failed") {
              toast.success("Order successfully cancel");
            } else if (statusToUpdate === "onprocess") {
              toast.success("Order is being processed");
            } else if (statusToUpdate === "success") {
              toast.success("Order completed successfully");
            }
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to update order");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  //handle close modal
  const closeModal = () => {
    setPrintData("");
  };

  const confirmUpdate = (data, status) => {
    setDataUpdate(data);
    setStatusToUpdate(status);
    setShowConfirmModalUpdate(true);
  };

  //handle close gambar besar
  const closeModalOrder = (id) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
  };

  return (
    <div ref={targetRef} className="pb-8 w-full">
      <div className="flex">
        <Layout2 />
        <div className=" pl-5 pt-20 w-full bg-white overflow-auto lg:border-l-2">
          <div className="overflow-y-auto overflow-x-hidden pr-2 lg:max-h-[calc(100vh-80px)] custom-scrollbar">
            <Toaster position="top-center" reverseOrder={false} />
            <h1 className="my-2 md:my-5 font-ubuntu font-semibold text-darkgray text-lg md:text-xl">
              Transaction Data Settings
            </h1>

            <div className="flex justify-between mb-4 ">
              <div className="flex items-center ">
                <InputSearch
                  role={dataOutlet.role}
                  type="text"
                  placeholder="Outlet Name. . ."
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onRightButtonCLick={() => fetchDataPaginated(true)}
                  rightButton={<IoSearch />}
                  isLoading={isLoading}
                  inputLeft={true}
                  typeLeft="text"
                  placeholderLeft="Name Transaction. . ."
                  idLeft="by_name"
                  valueLeft={by_name}
                  onchangeLeft={(e) => setQueryByName(e.target.value)}
                />
              </div>

              <CardRevenue
                value={orderActive}
                desc="Active Orders"
                classRevenue=" max-w-[150px]"
              />
            </div>

            <div className="rounded-lg bg-white overflow-x-auto">
              <div className="min-w-full px-4 py-4">
                <div className="text-gray-700 font-nunito mb-4">
                  {orders && orders.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                          Waiting Orders
                        </h2>
                        <span className="flex gap-[2px] mt-2">
                          <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0ms]"></span>
                          <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:150ms]"></span>
                          <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:300ms]"></span>
                        </span>
                      </div>
                    </>
                  )}

                  {/* Wrapper semua card orders */}
                  <div className="flex flex-wrap gap-4">
                    {orders
                      .slice()
                      .reverse()
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center w-full sm:w-auto"
                        >
                          <div className="flex flex-col justify-between bg-white shadow-md rounded-lg p-3 w-[222px] border border-gray-300 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex flex-col gap-1 flex-grow">
                              <h2 className="text-xl font-bold text-gray-800 text-center">
                                {item.outlet_name}
                              </h2>
                              <div className="flex flex-col text-gray-700 text-sm">
                                <p>
                                  <span className="font-semibold">
                                    Customer:
                                  </span>{" "}
                                  {item.by_name}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Table Number:
                                  </span>{" "}
                                  {item.Table.number_table}
                                </p>
                              </div>

                              <div className="bg-gray-100 rounded-lg p-2 mt-1">
                                <p className="font-semibold text-sm text-gray-800 mb-1">
                                  Order:
                                </p>
                                {item.orderData.map((order) => (
                                  <div key={order.title} className="mb-1">
                                    <div className="flex justify-between text-sm">
                                      <p>{order.title}</p>
                                      <p>{FormatIDR(order.total_price)}</p>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {order.qty} x {FormatIDR(order.price)}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between font-bold text-sm mt-2">
                                <p>Total</p>
                                <p>{FormatIDR(item.total_pay)}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                              <AcceptOrder
                                createdAt={item.date}
                                status={item.status}
                                handleAccept={() => {
                                  closeModalOrder(item.id);
                                  fetchDataPaginated(true);
                                }}
                              />
                              <button
                                onClick={() => confirmUpdate(item, "failed")}
                                className="bg-red-500 text-white text-sm rounded-lg py-2 w-full hover:bg-red-600 transition-colors duration-300"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Section searchQuery */}
                {isLoading ? (
                  <TableSkeleton />
                ) : (
                  <div className="text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchQuery &&
                      searchQuery.map((item, index) => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-300 shadow-sm rounded-lg p-4 w-full flex flex-col justify-between relative"
                        >
                          {/* Nomor Meja */}
                          <div className="absolute top-0 left-0 rounded-tl-md rounded-br-md bg-white border w-14 h-8 flex items-center justify-center font-bold text-sm">
                            {item.Table.number_table}
                          </div>

                          {/* Status */}
                          <div
                            className={`absolute top-0 right-0 px-2 py-1 w-16 h-8 text-xs rounded-tr-md rounded-bl-md bg-gray-100 font-semibold capitalize flex items-center justify-center
                             ${
                               item.status === "active"
                                 ? "text-yellow-600"
                                 : item.status === "onprocess"
                                 ? "text-green-600"
                                 : item.status === "success"
                                 ? "text-blue-600"
                                 : item.status === "failed"
                                 ? "text-red-600"
                                 : ""
                             }`}
                          >
                            {item.status}
                          </div>

                          {/* Outlet & Customer */}
                          <div className="mt-10">
                            <p className="text-sm text-gray-500">
                              {HighlightText(item.by_name, by_name)}
                            </p>
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
                                  <p>{FormatIDR(order.total_price)}</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {order.qty} x {FormatIDR(order.Menu.price)}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end font-bold text-sm mt-1 p-2">
                            <p>{FormatIDR(item.total_pay)}</p>
                          </div>

                          {/* Tombol */}
                          <div className="mt-4 flex gap-2">
                            {item.status === "active" && (
                              <button
                                className="bg-blue-100 w-1/2 text-blue-700 text-sm py-1 rounded hover:bg-blue-200"
                                onClick={() => confirmUpdate(item, "onprocess")}
                              >
                                Paid
                              </button>
                            )}
                            {item.status === "onprocess" && (
                              <button
                                className="w-1/2 bg-green-100 text-green-700 text-sm py-1 rounded hover:bg-green-200"
                                onClick={() => confirmUpdate(item, "success")}
                              >
                                Finish Order
                              </button>
                            )}
                            {item.status === "success" && (
                              <button
                                className="w-full bg-gray-200 text-gray-700 text-sm py-1 rounded hover:bg-gray-200"
                                onClick={() => setPrintData([item])}
                              >
                                Print
                              </button>
                            )}
                            {!["success", "failed"].includes(item.status) && (
                              <button
                                className="w-1/2 bg-red-100 text-red-600 text-sm py-1 rounded hover:bg-red-200"
                                onClick={() => confirmUpdate(item, "failed")}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
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
                  <div className="w-[350px]  p-4  bg-white shadow-md rounded-md font-nunito text-sm">
                    <div className="flex justify-center ">
                      <div className="flex p-1 w-14 h-10">
                        {item.Outlet.logo && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.Outlet.logo}`}
                            className="w-full h-full object-contain"
                            alt="Logo"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <h1 className="font-bold text-lg w-full text-center">
                        {item.Outlet.outlet_name}
                      </h1>
                      <p className="text-center">{item.Outlet.address}</p>
                    </div>

                    <div className="border-t border-dashed my-2"></div>

                    <div className="flex justify-between">
                      <p className="w-32">{FormatDate(item.updatedAt)}</p>
                      <p className="w-24 text-end">{item.by_name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>No.{item.Table.number_table}</p>
                    </div>

                    <div className="border-t border-dashed my-2"></div>

                    {item.Orders.map((order) => (
                      <div key={order.id} className="mb-1">
                        <div className="flex justify-between text-sm">
                          <p>{order.Menu.title}</p>
                          <p>{FormatIDR(order.total_price)}</p>
                        </div>
                        <p className="text-sm">
                          {order.qty} x {FormatIDR(order.Menu.price)}
                        </p>
                      </div>
                    ))}

                    <div className="border-t border-dashed my-2"></div>

                    <div className="flex justify-between font-bold">
                      <p>Total</p>
                      <p>{FormatIDR(item.total_pay)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Payed ({item.pays_method})</p>
                      <p>{FormatIDR(item.total_pay)}</p>
                    </div>

                    <div className="border-t border-dashed my-2"></div>

                    <div>
                      <p className="text-center">- Thank You -</p>

                      {item.Outlet.Contacts.map((contact) => {
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

          {showConfirmModalUpdate && (
            <HanldeUpdateStatus
              handleUpdate={handleUpdate}
              setShowConfirmModalUpdate={() => setShowConfirmModalUpdate(false)}
              text={statusToUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
