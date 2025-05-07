"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "nextjs-toploader/app";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import ButtonCreateUpdate from "@/app/component/button/button";
import { useFormik } from "formik";
import * as yup from "yup";
import Input from "@/app/component/form/input";
import Select from "@/app/component/form/select";
import { handleApiError } from "@/app/component/handleError/handleError";
import { useSelector } from "react-redux";

export default function AddTable({ params }) {
  const [outlet, setOutlet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const { slug } = React.use(params);
  const dataOutlet = useSelector((state) => state.counter.outlet);

  // cek token
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const decoded = jwtDecode(refreshToken);
      const expirationTime = new Date(decoded.exp * 1000);
      const currentTime = new Date();

      if (currentTime > expirationTime) {
        localStorage.clear();
        router.push(`/login`);
      }
    } else {
      router.push(`/login`);
    }
  }, []);

  useEffect(() => {
    if (dataOutlet.role !== "admin pusat") {
      formik.setFieldValue("id_outlet", dataOutlet.id);
    }
  }, [dataOutlet]);

  //handle edit dan create
  const onSubmit = async (e) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formik.values.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/update/${formik.values.id}`,
          formik.values,
          { headers }
        );
        router.push("/admin/table");
        localStorage.removeItem("id_table");
        localStorage.setItem("newData", "update successfully!");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/create`,
          formik.values,
          { headers }
        );
        router.push("/admin/table");
        localStorage.setItem("newData", "create successfully!");
      }
    } catch (error) {
      await handleApiError(error, onSubmit, router);
    }
  };

  const formik = useFormik({
    initialValues: {
      id_outlet: "",
      number_table: "",
    },
    onSubmit,
    validationSchema: yup.object({
      id_outlet: yup.number().required(),
      number_table: yup
        .number()
        .typeError("Must be a number")
        .required("number table is a required"),
    }),
  });

  //menampilkan semua DATA OUTLET
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const token = localStorage.getItem("token");
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
        await handleApiError(error, () => fetchData(), router);
      }
    };

    setIsLoading(false);

    fetchData();
  }, []);

  //mengambildata table ketika edit
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        if (slug === "edit") {
          const tableCode = localStorage.getItem("table_code");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/table/showtablecode/${tableCode}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data.data;
          formik.setValues(data);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        await handleApiError(error, () => fetchData(), router);
      }
    };

    fetchData();
  }, []);

  const handleCancel = () => {
    router.push("/admin/table");
    localStorage.removeItem("id_table");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

  return (
    <div className="p-8 pt-20 w-full">
      <div className="overflow-y-auto overflow-x-hidden pr-2 lg:max-h-[calc(100vh-80px)] custom-scrollbar">
        <h2 className="text-xl font-nunito">Manage Table</h2>
        {isLoading ? (
          <EditDataSkeleton />
        ) : (
          <form
            className="mt-4 border p-8 grid gap-4 "
            onSubmit={formik.handleSubmit}
          >
            <div
              className={`${
                dataOutlet.role !== "admin pusat" ? "hidden" : "flex"
              } gap-4 mb-2`}
            >
              <Select
                label="Outlate Name:"
                id="id_outlet"
                name="id_outlet"
                value={formik.values.id_outlet}
                options={outlet.map((value) => (
                  <option key={value.id} value={value.id}>
                    {value.outlet_name}
                  </option>
                ))}
                placeholder={"Select outlet name"}
                onChange={handleChange}
                errorMessage={formik.errors.id_outlet}
                isError={
                  formik.touched.id_outlet && formik.errors.id_outlet
                    ? true
                    : false
                }
              />
            </div>

            <Input
              label="Number Table :"
              id="number_table"
              placeholder="number table"
              name="number_table"
              type="text"
              value={formik.values.number_table}
              onChange={handleChange}
              errorMessage={formik.errors.number_table}
              isError={
                formik.touched.number_table && formik.errors.number_table
                  ? true
                  : false
              }
            />

            <ButtonCreateUpdate
              loadingButton={loadingButton}
              handleCancel={handleCancel}
            />
          </form>
        )}
      </div>
    </div>
  );
}
