"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../../../component/token/refreshToken";
import Input from "@/app/component/form/input";
import { useFormik } from "formik";
import * as yup from "yup";
import Select from "@/app/component/form/select";
import ButtonCreateUpdate from "@/app/component/button/button";
import { handleApiError } from "@/app/component/handleError/handleError";

export default function AddCategory({ params }) {
  const [outlet, setOutlet] = useState([]);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const { slug } = React.use(params);

  //handle edit dan create
  const onSubmit = async () => {
    const formData = {
      id_outlet: formik.values.id_outlet,
      type: formik.values.type,
      descriptions: formik.values.descriptions,
    };

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formik.values.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/category/update/${formik.values.id}`,
          formData,
          { headers }
        );
        localStorage.removeItem("id_category");
        localStorage.setItem("newData", "updated successfully!");
        router.push("/admin/category");
      } else {
        setLoadingButton(true);

        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/category/create`,
          formData,
          { headers }
        );
        localStorage.setItem("newData", "create successfully!");
        router.push("/admin/category");
      }
    } catch (error) {
      await handleApiError(error, onSubmit, router);
    }
  };

  const formik = useFormik({
    initialValues: {
      id_outlet: "",
      type: "",
      descriptions: "",
    },
    onSubmit,
    validationSchema: yup.object({
      id_outlet: yup.number().required(),
      type: yup.string().required(),
      descriptions: yup.string().required(),
    }),
  });

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

  // cek token
  useEffect(() => {
    const savedToken = localStorage.getItem("refreshToken");
    const token = localStorage.getItem("token");

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
            setRole(data.role);
            if (data.role !== "admin") {
              formik.setFieldValue("id_outlet", data.id);
            }
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  // menampilkan data categori ketika edit
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idCategory = localStorage.getItem("id_category");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/category/show/${idCategory}`,
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
  }, []);

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

  const handleCancel = () => {
    router.push("/admin/category");
    localStorage.removeItem("id_category");
  };

  return (
    <div className="p-8 pt-20 w-full">
      <h2 className="text-xl font-nunito">Manage category</h2>
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
              id="id_outlet"
              name="id_outlet"
              value={formik.values.id_outlet}
              options={outlet.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.outlet_name}
                </option>
              ))}
              placeholder={"Select Outlet Name"}
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
            label="Type :"
            id="type"
            placeholder="type"
            name="type"
            type="text"
            value={formik.values.type}
            onChange={handleChange}
            errorMessage={formik.errors.type}
            isError={formik.touched.type && formik.errors.type ? true : false}
          />
          <Input
            label="Descriptions :"
            id="descriptions"
            placeholder="descriptions"
            name="descriptions"
            type="text"
            value={formik.values.descriptions}
            onChange={handleChange}
            errorMessage={formik.errors.descriptions}
            isError={
              formik.touched.descriptions && formik.errors.descriptions
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
  );
}
