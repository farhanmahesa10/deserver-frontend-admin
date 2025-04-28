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

export default function AddGallery({ params }) {
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
    if (dataOutlet.role !== "admin") {
      formik.setFieldValue("id_outlet", dataOutlet.id);
    }
  }, [dataOutlet]);

  //handle edit dan create
  const onSubmit = async (e) => {
    const formData = new FormData();
    formData.append("id_outlet", formik.values.id_outlet);
    formData.append("title", formik.values.title);
    formData.append("image", formik.values.image);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formik.values.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/update/${formik.values.id}`,
          formData,
          { headers }
        );
        router.push("/admin/gallery");
        localStorage.removeItem("id_gallery");
        localStorage.setItem("newData", "update successfully!");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/create`,
          formData,
          { headers }
        );
        router.push("/admin/gallery");
        localStorage.setItem("newData", "create successfully!");
      }
    } catch (error) {
      await handleApiError(error, onSubmit, router);
    }
  };

  const formik = useFormik({
    initialValues: {
      id_outlet: "",
      title: "",
      image: "",
    },
    onSubmit,
    validationSchema: yup.object({
      id_outlet: yup.number().required(),
      title: yup.string().required(),
      image: yup.mixed().when("id", {
        is: (id) => !id,
        then: (schema) =>
          schema
            .required()
            .test(
              "fileType",
              "Invalid image format (jpg, jpeg, png only)",
              (value) =>
                ["image/jpeg", "image/png", "image/jpg"].includes(value?.type)
            )
            .test(
              "fileSize",
              "Maximum image size 2MB",
              (value) => value && value.size <= 2 * 1024 * 1024
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
  });

  //menampilkan semua DATA OUTLET
  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
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

  //mengambildata gallery ketika edit
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idGallery = localStorage.getItem("id_gallery");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/show/${idGallery}`,
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

  const handleCancel = () => {
    router.push("/admin/gallery");
    localStorage.removeItem("id_gallery");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

  // Handle pilihan gambar dari folder
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar (maksimal 2MB)!");
      return;
    }
    formik.setFieldValue("image", file);
  };

  return (
    <div className="p-8 pt-20 w-full">
      <div className="overflow-y-auto overflow-x-hidden pr-2 lg:max-h-[calc(100vh-80px)] custom-scrollbar">
        <h2 className="text-xl font-nunito">Manage Gallery</h2>
        {isLoading ? (
          <EditDataSkeleton />
        ) : (
          <form
            className="mt-4 border p-8 grid gap-4 "
            onSubmit={formik.handleSubmit}
          >
            <div
              className={`${
                dataOutlet.role !== "admin" ? "hidden" : "flex"
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

            <div className="flex gap-4 mb-2">
              <Input
                label="Image :"
                id="image"
                placeholder="image"
                name="image"
                type="file"
                inputBorder="w-52"
                onChange={handleFileChange}
                errorMessage={formik.errors.image}
                isError={
                  formik.touched.image && formik.errors.image ? true : false
                }
              />
            </div>
            {formik.values.image && (
              <div className="flex gap-4 mb-2">
                <label className="min-w-28 lg:w-52">Preview:</label>
                <img
                  src={
                    typeof formik.values.image === "object"
                      ? URL.createObjectURL(formik.values.image)
                      : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${formik.values.image}`
                  }
                  alt="event Preview"
                  className="mx-auto w-40 h-40 object-cover"
                />
              </div>
            )}
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
