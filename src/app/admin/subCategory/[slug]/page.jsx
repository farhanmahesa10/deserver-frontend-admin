"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import ButtonCreateUpdate from "@/app/component/button/button";
import { useFormik } from "formik";
import * as yup from "yup";
import Input from "@/app/component/form/input";
import Select from "@/app/component/form/select";
import { useSelector } from "react-redux";
import instance from "@/app/component/api/api";

export default function AddsubCategory({ params }) {
  const [category, setCategory] = useState([]);
  const [outlet, setOutlet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const dataOutlet = useSelector((state) => state.counter.outlet);
  const { slug } = React.use(params);

  //handle edit dan create
  const onSubmit = async (e) => {
    try {
      if (formik.values.id) {
        setLoadingButton(true);
        await instance.put(
          `/api/v1/subcategory/update/${formik.values.id}`,
          formik.values
        );
        router.push("/admin/subCategory");
        localStorage.removeItem("id_subCategory");
        localStorage.removeItem("outlet_name");
        localStorage.setItem("newData", "update successfully!");
      } else {
        setLoadingButton(true);
        await instance.post(`/api/v1/subcategory/create`, formik.values);
        router.push("/admin/subCategory");
        localStorage.setItem("newData", "create successfully!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      outlet_name: "",
      id_category: "",
      title: "",
    },
    onSubmit,
    validationSchema: yup.object({
      outlet_name: yup.string().notRequired(),
      id_category: yup.number().required(),
      title: yup.string().required(),
    }),
  });

  // masukan outletname
  useEffect(() => {
    const outletName = localStorage.getItem("outlet_name");

    if (dataOutlet.role === "admin pusat") {
      if (slug == "edit") {
        formik.setFieldValue("outlet_name", outletName);
      }
    } else {
      formik.setFieldValue("outlet_name", dataOutlet.outlet_name);
    }
  }, [dataOutlet]);

  //menampilkan semua DATA OUTLET
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        instance;
        // Mengambil data transaksi menggunakan instance dengan query params
        const response = await instance.get(`/api/v1/outlet/show`);

        const data = response.data.data;

        setOutlet(data);
      } catch (error) {
        console.error(error);
      }
    };

    setIsLoading(false);

    fetchData();
  }, []);

  //menampilkan data category
  useEffect(() => {
    const fetchData = async () => {
      if (formik.values.outlet_name) {
        try {
          // Mengambil data transaksi menggunakan instance dengan query params
          const response = await instance.get(
            `/api/v1/category/showcafename/${formik.values.outlet_name}`
          );

          const data = response.data.data;

          setCategory(data);
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        }
      }
    };

    setIsLoading(false);

    fetchData();
  }, [formik.values.outlet_name]);

  //mengambil data subcategori by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idsubCategory = localStorage.getItem("id_subCategory");

          const response = await instance.get(
            `/api/v1/subcategory/showbyid/${idsubCategory}`
          );

          const data = response.data.data;
          formik.setValues(data);

          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [slug]);

  const handleCancel = () => {
    router.push("/admin/subCategory");
    localStorage.removeItem("id_subCategory");
    localStorage.removeItem("outlet_name");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

  return (
    <div className="p-8 pt-20 w-full">
      <div className="overflow-y-auto overflow-x-hidden pr-2 lg:max-h-[calc(100vh-80px)] custom-scrollbar">
        <h2 className="text-xl font-nunito">Manage Subcategory</h2>
        {isLoading ? (
          <EditDataSkeleton />
        ) : (
          <form
            className="mt-4 border p-8 grid gap-4"
            onSubmit={formik.handleSubmit}
          >
            <div
              className={`${
                dataOutlet.role !== "admin pusat" ? "hidden" : "flex"
              } ${slug == "edit" ? "hidden" : "flex"} gap-4 mb-2`}
            >
              <Select
                label="Outlet Name:"
                id="outlet_name"
                name="outlet_name"
                value={formik.values.outlet_name}
                options={outlet.map((value) => (
                  <option key={value.id} value={value.outlet_name}>
                    {value.outlet_name}
                  </option>
                ))}
                placeholder={"Select outlet name"}
                onChange={handleChange}
                errorMessage={formik.errors.outlet_name}
                isError={
                  formik.touched.outlet_name && formik.errors.outlet_name
                    ? true
                    : false
                }
              />
            </div>

            <Select
              label="Category :"
              id="id_category"
              name="id_category"
              value={formik.values.id_category}
              options={category.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.type}
                </option>
              ))}
              placeholder={"Select category name"}
              onChange={handleChange}
              errorMessage={formik.errors.id_category}
              isError={
                formik.touched.id_category && formik.errors.id_category
                  ? true
                  : false
              }
            />

            <Input
              label="Title :"
              id="title"
              placeholder="Title"
              name="title"
              type="text"
              value={formik.values.title}
              onChange={handleChange}
              errorMessage={formik.errors.title}
              isError={
                formik.touched.title && formik.errors.title ? true : false
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
