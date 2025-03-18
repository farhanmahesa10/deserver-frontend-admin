"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../../../component/token/refreshToken";
import ButtonCreateUpdate from "@/app/component/button/button";
import { useFormik } from "formik";
import * as yup from "yup";
import Input from "@/app/component/form/input";
import Select from "@/app/component/form/select";
import { handleApiError } from "@/app/component/handleError/handleError";

export default function AddsubCategory({ params }) {
  const [category, setCategory] = useState([]);
  const [outlet, setOutlet] = useState([]);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const { slug } = React.use(params);

  //handle edit dan create
  const onSubmit = async (e) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formik.values.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/update/${formik.values.id}`,
          formik.values,
          { headers }
        );
        localStorage.removeItem("id_subCategory");
        localStorage.removeItem("outlet_name");
        localStorage.setItem("newData", "update successfully!");
        router.push("/admin/subCategory");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/create`,
          formik.values,
          { headers }
        );
        localStorage.setItem("newData", "create successfully!");
        router.push("/admin/subCategory");
      }
    } catch (error) {
      await handleApiError(error, onSubmit, router);
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
      outlet_name: yup.string().required(),
      id_category: yup.number().required(),
      title: yup.string().required(),
    }),
  });

  // cek token
  useEffect(() => {
    const savedToken = localStorage.getItem("refreshToken");
    const token = localStorage.getItem("token");
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
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outlet_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((response) => {
            const data = response.data.data;
            if (data.role === "admin") {
              if (slug == "edit") {
                formik.setFieldValue("outlet_name", outletName);
              }
            } else {
              formik.setFieldValue("outlet_name", data.outlet_name);
            }
            setRole(data.role);
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

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

  //menampilkan data category
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      if (formik.values.outlet_name) {
        try {
          // Mengambil data transaksi menggunakan axios dengan query params
          const response = await axios.get(
            ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/category/showcafename/${formik.values.outlet_name}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idsubCategory = localStorage.getItem("id_subCategory");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/showbyid/${idsubCategory}`,
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
        console.error("Error fetching data:", error);
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
      <h2 className="text-xl font-nunito">Manage subCategory</h2>
      {isLoading ? (
        <EditDataSkeleton />
      ) : (
        <form
          className="mt-4 border p-8 grid gap-4"
          onSubmit={formik.handleSubmit}
        >
          <div className={`${role !== "admin" ? "hidden" : "flex"} gap-4 mb-2`}>
            <Select
              label="Outlate Name:"
              id="outlet_name"
              name="outlet_name"
              value={formik.values.outlet_name}
              options={outlet.map((value) => (
                <option key={value.id} value={value.outlet_name}>
                  {value.outlet_name}
                </option>
              ))}
              placeholder={"Select Outlet Name"}
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
            placeholder={"Select category Name"}
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
            placeholder="title"
            name="title"
            type="text"
            value={formik.values.title}
            onChange={handleChange}
            errorMessage={formik.errors.title}
            isError={formik.touched.title && formik.errors.title ? true : false}
          />
          <ButtonCreateUpdate
            loadingButton={loadingButton}
            handleCancel={handleCancel}
          />
        </form>
      )}
    </div>
  );
}
