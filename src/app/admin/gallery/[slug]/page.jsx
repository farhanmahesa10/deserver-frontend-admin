"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../../../component/refreshToken/refreshToken";
import ButtonCreateUpdate from "@/app/component/button/button";
import { useFormik } from "formik";
import * as yup from "yup";
import Input from "@/app/component/form/input";
import Select from "@/app/component/form/select";

export default function AddGallery({ params }) {
  const [outlet, setOutlet] = useState([]);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const { slug } = React.use(params);

  // cek token
  useEffect(() => {
    const savedToken = localStorage.getItem("refreshToken");

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

  //handle edit dan create
  const onSubmit = async (e) => {
    const formData = new FormData();
    formData.append("id_outlet", formik.values.id_outlet);
    formData.append("title", formik.values.title);
    formData.append("image", formik.values.image);

    const handleError = async (error) => {
      if (error.response?.status === 401) {
        try {
          const newToken = await getNewAccessToken();
          localStorage.setItem("token", newToken); // Simpan token baru
          await handleSubmit(e); // Ulangi proses dengan token baru
        } catch (err) {
          console.error("Failed to refresh token:", err);
          alert("Session Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          router.push("/login");
        }
      } else {
        console.error("Error deleting gallery:", error);
      }
    };

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
        localStorage.removeItem("id_gallery");
        alert("Data berhasil diperbarui!");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/create`,
          formData,
          { headers }
        );
        alert("Data berhasil ditambahkan!");
      }

      router.push("/admin/gallery");
      setLoadingButton(false);
    } catch (error) {
      await handleError(error);
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
      image: yup
        .mixed()
        .required()
        .test(
          "fileType",
          "Format gambar tidak valid (hanya jpg, jpeg, png)",
          (value) =>
            ["image/jpeg", "image/png", "image/jpg"].includes(value?.type)
        )
        .test(
          "fileSize",
          "Ukuran gambar maksimal 2MB",
          (value) => value && value.size <= 2 * 1024 * 1024
        ),
    }),
  });

  //menampilkan semua DATA OUTLET
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        // Mengambil data transaksi menggunakan axios dengan query params
        const response = await axios.get(
          ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show`
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
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idGallery = localStorage.getItem("id_gallery");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/show/${idGallery}`
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
      <h2 className="text-xl font-nunito">Manage gallery</h2>
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

          <div className="flex gap-4 mb-2">
            <label htmlFor="image" className="min-w-28 lg:w-52">
              image:
            </label>
            <input
              className="border rounded-lg border-primary50 w-full h-8"
              id="image"
              type="file"
              name="image"
              onChange={handleFileChange}
            />
          </div>
          {formik.values.image && (
            <div className="flex gap-4 mb-2">
              <label className="min-w-28 lg:w-52">Preview:</label>
              <img
                src={
                  typeof formik.values.image === "object"
                    ? URL.createObjectURL(formik.values.image)
                    : `${process.env.NEXT_PUBLIC_BASE_API_URL}/${formik.values.image}`
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
  );
}
