"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../adminSkeleton/editDataSkeleton";
import { getNewAccessToken } from "../../refreshToken";
import { Toaster, toast } from "react-hot-toast";
export default function AddOrder({ params }) {
  const [transaction, setTransaction] = useState({
    id_table: "",
    by_name: "",
    status: "not yet paid",
    pays_method: "cashier",
    total_pay: "",
    note: "",
  });
  const [outletName, setoutletName] = useState("");
  const [role, setRole] = useState("");
  const [outlet, setOutlet] = useState([]);
  const [pesanan, setPesanan] = useState([]);
  const [table, setTable] = useState([]);
  const [dataMenu, setDataMenu] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);

  const router = useRouter();
  const { slug } = React.use(params);

  // cek token
  useEffect(() => {
    const savedToken = localStorage.getItem("refreshToken");
    const outletName = localStorage.getItem("outlet_name");

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
            if (data.role === "admin") {
              if (slug == "edit") {
                setoutletName(outletName);
              }
            } else {
              setoutletName(data.outlet_name);
            }
            setRole(data.role);
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  //mengambildata TRANSAKSI ketika edit
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       if (slug === "edit") {
  //         const idTransaction = localStorage.getItem("id_transaction");

  //         const response = await axios.get(
  //           `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/transaction/show/${idTransaction}`
  //         );

  //         const data = response.data.transactions[0];
  //         setTransaction(data);
  //         setPesanan(data.orders);

  //         setIsLoading(false);
  //       } else {
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  //menampilkan semua DATA OUTLET
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        // Mengambil data transaksi menggunakan axios dengan query params
        const response = await axios.get(
          ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show`
        );

        const data = response.data;

        setOutlet(data);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };

    setIsLoading(false);

    fetchData();
  }, []);

  //menampilkan semua TABLE
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      if (outletName) {
        try {
          // Mengambil data transaksi menggunakan axios dengan query params
          const response = await axios.get(
            ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/showcafename/${outletName}`
          );

          const data = response.data;

          setTable(data);
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        }
      }
    };

    setIsLoading(false);

    fetchData();
  }, [outletName]);

  //menampilkan semua MENU
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      if (outletName) {
        try {
          // Mengambil data transaksi menggunakan axios dengan query params
          const response = await axios.get(
            ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/MENU/showall/${outletName}`
          );

          const data = response.data;

          setDataMenu(response.data[0].categories);
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        }
      }
    };

    setIsLoading(false);

    fetchData();
  }, [outletName]);

  //handle chekout
  const handleSubmit = async () => {
    if (!transaction.id_table) {
      toast.error("please fill in the table");
      setLoadingButton(false);
      return;
    }
    if (!transaction.by_name) {
      toast.error("please fill in the name");
      setLoadingButton(false);
      return;
    }
    setLoadingButton(true);
    try {
      const total = pesanan.reduce(
        (total, item) => total + item.qty * item.price,
        0
      );
      const dataTransaksi = {
        id_table: transaction.id_table,
        by_name: transaction.by_name,
        id_outlet: "1",
        status: "not yet paid",
        pays_method: "cashier",
        total_pay: total,
        note: transaction.note,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/transaction/create`,
        dataTransaksi
      );

      const transaksiId = response.data.data.id;

      if (!transaksiId) {
        console.error("transaksi_id tidak tersedia");
        return;
      }

      const formData = pesanan.map((d) => ({
        id_transaction: transaksiId, // Menggunakan transaksi_id yang baru di-set
        id_menu: d.id,
        qty: d.qty,
        total_price: d.price * d.qty,
      }));

      try {
        // Mengirim formData ke API pemesanan
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/order/create`,
          formData
        );

        router.push(`/`);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      setLoadingButton(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
    localStorage.removeItem("id_menu");
    localStorage.removeItem("outlet_name");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction((transaction) => ({
      ...transaction,
      [name]: value,
    }));
  };

  const handleToggle = (item) => {
    setPesanan((prevPesanan) => {
      const existingItem = prevPesanan.find((menu) => menu.id === item.id);

      if (existingItem) {
        // Jika ID sudah ada, hapus dari array
        return prevPesanan.filter((menu) => menu.id !== item.id);
      } else {
        // Jika ID belum ada, tambahkan ke array dengan qty = 1
        return [...prevPesanan, { ...item, qty: 1 }];
      }
    });
  };

  // Fungsi Increment
  const increment = ({ id }) => {
    setPesanan((prevPesanan) =>
      prevPesanan.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // Fungsi Decrement
  const decrement = ({ id }) => {
    setPesanan(
      (prevPesanan) =>
        prevPesanan
          .map((item) =>
            item.id === id ? { ...item, qty: item.qty - 1 } : item
          )
          .filter((item) => item.qty > 0) // Menghapus item jika qty < 1
    );
  };

  return (
    <div className="p-8 pt-20 w-full">
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-xl font-nunito">Manage menu</h2>
      {isLoading ? (
        <EditDataSkeleton />
      ) : (
        <>
          <div
            className={`${role !== "admin" ? "hidden" : "flex"} ${
              slug === "edit" ? "hidden" : "flex"
            } gap-4 mb-2 mt-10`}
          >
            <label
              htmlFor="id_outlet"
              className="body-text-sm-normal md:body-text-base-normal font-nunitoSans min-w-28 lg:w-32"
            >
              Outlate Name:
            </label>
            <select
              className="border p-1 rounded-lg border-primary50 w-1/3 h-8"
              id="id_outlet"
              name="id_outlet"
              value={outletName}
              onChange={(e) => setoutletName(e.target.value)}
            >
              <option value="" className="bg-primary50 " disabled>{`${
                slug == "create" ? "Select Outlet Name" : outletName
              }`}</option>
              {outlet.map((value) => (
                <option key={value.id} value={value.outlet_name}>
                  {value.outlet_name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 border p-8 grid gap-4">
            <>
              {dataMenu.map((item) => (
                <div id={item.type} key={item.id} className="mb-5">
                  <h1 className="font-bold capitalize text-center text-3xl md:text-5xl text-black mb-4">
                    {item.type}
                  </h1>

                  {item.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="mt-6 grid md:grid-cols-5 grid-cols-3  gap-2"
                    >
                      {sub.menus.map((menu) => {
                        const imageUrl = `${
                          process.env.NEXT_PUBLIC_BASE_API_URL
                        }/${encodeURIComponent(menu.photo)}`;

                        // Perbaikan: Ganti item.id menjadi menu.id
                        const isSelected = pesanan.some(
                          (order) => order.id === menu.id
                        );

                        return (
                          <div
                            key={menu.id}
                            id={menu.title}
                            className="bg-white h-52 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                          >
                            <div
                              className="h-28 w-full rounded-t-xl"
                              style={{
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            ></div>

                            <div className="p-1 text-center">
                              <h3 className="text-sm font-bold capitalize text-gray-800">
                                {menu.title}
                              </h3>
                              <span className="inline-block text-sm rounded-full">
                                Rp {menu.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-2">
                              <button
                                className={`${
                                  isSelected
                                    ? "bg-red-600 text-white"
                                    : "bg-primary50 text-black"
                                } w-full h-8 text-center  rounded-md transition-all`}
                                onClick={() =>
                                  handleToggle({
                                    id: menu.id,
                                    title: menu.title,
                                    price: menu.price,
                                  })
                                }
                              >
                                {isSelected ? "Hapus" : "Tambah"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </>

            <div className="min-w-72 lg:w-96 border-2 p-2 mx-auto">
              <h1 className="text-center">Rincian Pesanan</h1>
              {pesanan.length > 0 ? (
                pesanan.map((item) => (
                  <div key={item.id} className="border-t border-b p-4">
                    {/* Nama Produk & Harga */}
                    <div className="flex justify-between items-center">
                      <h1>{item.title}</h1>
                      <h1>Rp {item.price * item.qty}</h1>
                    </div>

                    {/* Tombol Tambah & Kurang */}
                    <div className="flex justify-between items-center">
                      <h1>Qty</h1>
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={() => decrement({ id: item.id })}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          -
                        </button>
                        <h1>{item.qty}</h1>
                        <button
                          onClick={() => increment({ id: item.id })}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Tidak ada pesanan</p>
              )}

              <div className={` flex gap-4 mb-2 mt-2`}>
                <label htmlFor="id_table" className="min-w-16 ">
                  Table:
                </label>
                <select
                  className="border p-1 rounded-lg border-primary50 w-full h-8"
                  id="id_table"
                  name="id_table"
                  value={transaction.id_table}
                  onChange={handleChange}
                >
                  <option value="" className="bg-primary50 " disabled>{`${
                    slug == "create" ? "Select table Number" : transaction.title
                  }`}</option>
                  {table.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.number_table}
                    </option>
                  ))}
                </select>
              </div>

              {/* nama */}

              <div className="flex items-center gap-4 mb-2">
                <label htmlFor="by_name" className="font-nunitoSans min-w-16 ">
                  nama:
                </label>
                <input
                  type="text"
                  placeholder="By name"
                  name="by_name"
                  value={transaction.by_name}
                  onChange={handleChange}
                  className="border rounded-md p-1 w-full shadow-inner focus:outline-primary100"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label htmlFor="note" className=" font-nunitoSans min-w-16 ">
                  catatan
                </label>
                <input
                  type="text"
                  placeholder="Catatan"
                  name="note"
                  value={transaction.note}
                  onChange={handleChange}
                  className="border rounded-md p-1 w-full shadow-inner focus:outline-primary100"
                  required
                />
              </div>
              <div className="flex justify-between mt-5 border-t">
                <h1>TOTAL PEMBAYARAN</h1>
                <h2>
                  {" "}
                  Rp.
                  {pesanan.reduce(
                    (total, item) => total + item.qty * item.price,
                    0
                  )}
                </h2>
              </div>
            </div>
            <div className="flex gap-8 text-white justify-center">
              <button
                disabled={loadingButton}
                onClick={() => handleSubmit()}
                className="bg-primary50 border-primary50 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
              >
                {loadingButton ? "Loading..." : "Submit"}
              </button>
              <button
                type="button"
                className="bg-red-500 border-red-5bg-red-500 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
