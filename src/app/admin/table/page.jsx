"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "nextjs-toploader/app";
import { Toaster, toast } from "react-hot-toast";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { handleApiError } from "@/app/component/handleError/handleError";
import * as yup from "yup";
import { FormikProvider, useFormik, FieldArray } from "formik";
import HanldeRemove from "@/app/component/handleRemove/handleRemove";
import Select from "@/app/component/form/select";

export default function Table() {
  const [table, setTable] = useState([]);
  const [role, setRole] = useState("");
  const [outletName, setOutletName] = useState("");
  const [idOutlet, setIdOutlet] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [searchQuery, setSearchQuery] = useState([]);
  const [query, setQuery] = useState("");
  const [outlet, setOutlet] = useState([{ outlet_name: "" }]);
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
          setOutletName(data.outlet_name);
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
      search: query.outlet_name == undefined ? outletName : query.outlet_name,
    };
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/showpaginated`,
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
      id_outlet: query.id == undefined ? idOutlet : query.id,
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
              .typeError("Must be a number")
              .required("number table is a required"),
          })
        )
        .min(1, "Minimum 1 table must be added"),
    }),
  });

  //menampilkan semua DATA OUTLET
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    const fetchData = async () => {
      try {
        // Mengambil data transaksi menggunakan axios dengan query params
        const response = await axios.get(
          ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data;

        setOutlet(data);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };

    setIsLoading(false);

    fetchData();
  }, []);

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

    loadData();
  }, [itemsPerPage, currentPage, query, outletName]);

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

  const handleInputChange = (event) => {
    const selectedOutlet = outlet.find(
      (item) => item.outlet_name === event.target.value
    );
    setQuery(selectedOutlet);
  };

  return (
    <div
      ref={targetRef}
      className=" pl-5 pt-20 pb-8 w-full bg-white overflow-auto border-l-2"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold text-lg md:text-xl">
        Table Data Settings
      </h1>

      <div className={`${role !== "admin" ? "hidden" : "flex"} gap-4 mb-2`}>
        <Select
          label="Outlet Name:"
          id="outlet_name"
          name="outlet_name"
          value={query?.outlet_name || ""}
          options={outlet.map((value, index) => (
            <option key={index} value={value.outlet_name}>
              {value.outlet_name}
            </option>
          ))}
          placeholder={"Select outlet name"}
          onChange={handleInputChange}
        />
      </div>

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
                  className={`absolute -top-1 right-1 text-lg text-red-500 font-bold hover:text-red-700`}
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
                    <div key={index} className="flex flex-col items-center">
                      <div
                        key={index}
                        className={`border-gray-300 w-20 h-20 border-2 rounded-lg flex flex-col justify-center items-center relative bg-white shadow-sm`}
                      >
                        <button
                          type="button"
                          onClick={() => arrayHelpers.remove(index)}
                          className={`absolute -top-1 right-1 text-lg text-red-500 font-bold hover:text-red-700`}
                        >
                          &times;
                        </button>
                        <input
                          name={`table[${index}].number_table`}
                          value={formik.values.table[index].number_table}
                          onChange={formik.handleChange}
                          className={`w-full text-4xl text-center rounded-[8px] p-2 focus:outline-none`}
                        />
                      </div>
                      {formik.touched.table?.[index]?.number_table &&
                        formik.errors.table?.[index]?.number_table && (
                          <div className="">
                            <span className="text-xs mt-10 text-red-400">
                              {formik.errors.table[index].number_table}
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={`flex w-20 h-20 border-2 rounded-lg text-4xl  flex-col justify-center items-center relative bg-white hover:bg-gray-100 shadow-sm`}
                    onClick={() => {
                      arrayHelpers.push({ number_table: "" });
                    }}
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
          formik.values.table[0]?.number_table == undefined ? "hidden" : "flex"
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
      </div>

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
