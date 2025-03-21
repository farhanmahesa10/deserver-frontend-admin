"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { Toaster, toast } from "react-hot-toast";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { NotData } from "@/app/component/notData/notData";
import { handleApiError } from "@/app/component/handleError/handleError";
import * as yup from "yup";
import { FormikProvider, useFormik, FieldArray } from "formik";
import HanldeRemove from "@/app/component/handleRemove/handleRemove";

export default function Table() {
  const [table, setTable] = useState([]);
  const [role, setRole] = useState("");
  const [idOutlet, setIdOutlet] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [edit, setEdit] = useState(true);
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
          setIdOutlet(data.id);
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
        `  ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/showpaginated`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;
      setTable(data);
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

  //handle edit dan create
  const onSubmit = async () => {
    const formData = formik.values.table.map((d) => ({
      id_outlet: idOutlet,
      number_table: d.number_table,
    }));

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/create`,
        formData,
        { headers }
      );

      formik.resetForm();
      await fetchDataPaginated();
      toast.success("create successfully!");
    } catch (error) {
      await handleApiError(error, onSubmit, router);
    }
  };

  const formik = useFormik({
    initialValues: {
      table: [],
    },
    onSubmit,
    validationSchema: yup.object({
      table: yup
        .array()
        .of(
          yup.object().shape({
            number_table: yup
              .number()
              .typeError("Harus berupa angka")
              .required("Nomor meja wajib diisi"),
          })
        )
        .min(1, "Minimal 1 meja harus ditambahkan"),
    }),
  });

  //useEffect mengambil data table
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

  //handle untuk menghapus data
  const handleRemove = async () => {
    const savedToken = localStorage.getItem("token");

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/delete/${dataToRemove}`,
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

  const iconEdit = () => {
    setEdit(!edit);
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

      <form className="flex gap-2 mb-4">
        <button
          onClick={iconEdit}
          type="button"
          className={` bg-yellow-700 text-white body-text-sm-bold font-nunitoSans px-4 py-2 md:px-5 md:py-3 rounded-md shadow-md hover:bg-yellow-700 transition-all duration-300`}
        >
          <HiMiniPencilSquare />
        </button>
      </form>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="flex flex-wrap gap-4">
          {searchQuery &&
            searchQuery.map((item) => (
              <div
                key={item.id}
                className="w-20 h-20 border-2 rounded-lg flex flex-col justify-center items-center relative bg-white shadow-sm"
              >
                <h1 className="text-4xl font-semibold">{item.number_table}</h1>
                <button
                  onClick={() => confirmRemove(item.id)}
                  className={`${
                    edit ? "hidden" : "absolute"
                  } -top-1 right-1 text-lg text-red-500 font-bold hover:text-red-700`}
                >
                  &times;
                </button>
              </div>
            ))}

          <FormikProvider value={formik}>
            <FieldArray
              name="table"
              render={(arrayHelpers) => (
                <div className="flex gap-4 flex-wrap">
                  {formik.values.table.map((friend, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 border-2 rounded-lg flex flex-col justify-center items-center relative bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}
                        className={`${
                          edit ? "hidden" : "absolute"
                        } -top-1 right-1 text-lg text-red-500 font-bold hover:text-red-700`}
                      >
                        &times;
                      </button>
                      <input
                        name={`table[${index}].number_table`}
                        value={formik.values.table[index].number_table}
                        onChange={formik.handleChange}
                        className={`w-full text-4xl text-center rounded-[8px] p-2 focus:outline-none`}
                      />
                      {formik.touched.table?.[index]?.number_table &&
                        formik.errors.table?.[index]?.number_table && (
                          <div className="h-6">
                            <span className="text-sm text-red-400">
                              {formik.errors.table[index].number_table}
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={`${
                      edit ? "hidden" : "flex"
                    } w-20 h-20 border-2 rounded-lg  flex-col justify-center items-center relative bg-white shadow-sm`}
                    onClick={() => arrayHelpers.push({ number_table: "" })}
                  >
                    +
                  </button>
                </div>
              )}
            />
          </FormikProvider>
        </div>
      )}

      <div
        className={`${
          edit ? "hidden" : "flex"
        } flex mt-5 gap-8 text-white justify-end`}
      >
        <button
          type={loadingButton ? "button" : "submit"}
          onClick={formik.handleSubmit}
          className={`${
            loadingButton ? "bg-gray-400" : "bg-primary50 border-primary50"
          }  body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md`}
        >
          {loadingButton ? "Loading..." : "Submit"}
        </button>
        <button
          type="button"
          className="bg-red-500 border-red-5bg-red-500 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
          onClick={iconEdit}
        >
          Cancel
        </button>
      </div>

      {/* Tampilkan pesan data kosong jika tidak ada data */}
      {isLoading === false && searchQuery.length === 0 && <NotData />}

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
