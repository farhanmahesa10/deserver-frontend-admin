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

export default function AddContact({ params }) {
  const [outlet, setOutlet] = useState([]);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const { slug } = React.use(params);

  const valueContact = [
    {
      contact_name: "Instagram",
    },
    {
      contact_name: "Whatsapp",
    },
    {
      contact_name: "Facebook",
    },
    {
      contact_name: "Twiter",
    },
    {
      contact_name: "Tik Tok",
    },
    {
      contact_name: "Youtube",
    },
  ];

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
          if (data.role !== "admin") {
            formik.setFieldValue("id_outlet", data.id);
          }
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

  //handle edit dan create
  const onSubmit = async () => {
    const formData = new FormData();
    formData.append("id_outlet", formik.values.id_outlet);
    formData.append("contact_name", formik.values.contact_name);
    formData.append("value", formik.values.value);
    formData.append("link", formik.values.link);
    formData.append("logo", formik.values.logo);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formik.values.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/contact/update/${formik.values.id}`,
          formData,
          { headers }
        );
        localStorage.removeItem("id_contact");
        localStorage.setItem("newData", "update successfully!");
        router.push("/admin/contact");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/contact/create`,
          formData,
          { headers }
        );
        localStorage.setItem("newData", "create successfully!");
        router.push("/admin/contact");
      }
    } catch (error) {
      await handleApiError(error, onSubmit, router);
    }
  };

  const formik = useFormik({
    initialValues: {
      id_outlet: "",
      contact_name: "",
      value: "",
      link: "",
      logo: "",
    },
    onSubmit,
    validationSchema: yup.object({
      id_outlet: yup.number().required(),
      contact_name: yup.string().required(),
      value: yup.string().required(),
      link: yup.string().required().url("Invalid URL format"),
      logo: yup.mixed().when("id", {
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

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

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

  //mengambildata contact ketika edit
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idContact = localStorage.getItem("id_contact");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/contact/show/${idContact}`,
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
    router.push("/admin/contact");
    localStorage.removeItem("id_contact");
  };

  // Handle pilihan gambar dari folder lokal
  const handleSelectImage = async (imageName) => {
    const response = await fetch(`/img/${imageName}`);
    const blob = await response.blob();

    // Buat objek File secara manual
    const file = new File([blob], imageName, { type: blob.type });
    formik.setFieldValue("logo", file);
  };

  return (
    <div className="p-8 pt-20 w-full">
      <h2 className="text-xl font-nunito">Manage Contact</h2>
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

          <Select
            label="Contact name:"
            id="contact_name"
            name="contact_name"
            value={formik.values.contact_name}
            options={valueContact.map((value) => (
              <option key={value.contact_name} value={value.contact_name}>
                {value.contact_name}
              </option>
            ))}
            placeholder={`${
              slug == "create"
                ? "Select contact name"
                : formik.values.contact_name
            }`}
            onChange={handleChange}
            errorMessage={formik.errors.contact_name}
            isError={
              formik.touched.contact_name && formik.errors.contact_name
                ? true
                : false
            }
          />

          <Input
            label="Value :"
            id="value"
            placeholder="Value"
            name="value"
            type="text"
            value={formik.values.value}
            onChange={handleChange}
            errorMessage={formik.errors.value}
            isError={formik.touched.value && formik.errors.value ? true : false}
          />
          <Input
            label="Link :"
            id="link"
            placeholder="Link"
            name="link"
            type="text"
            value={formik.values.link}
            onChange={handleChange}
            errorMessage={formik.errors.link}
            isError={formik.touched.link && formik.errors.link ? true : false}
          />
          <div className="flex gap-4 mb-2 ">
            <label htmlFor="photo" className="min-w-28 lg:w-40 ">
              Pilih Logo:
            </label>
            <div className="flex gap-2 flex-wrap ">
              {[
                "instagram.png",
                "tiktok.png",
                "facebook.png",
                "whatsapp.png",
                "twitter.png",
                "youtube.png",
              ].map((image) => (
                <button
                  key={image}
                  type="button"
                  className="border p-2 rounded-lg hover:bg-yellow-700"
                  onClick={() => handleSelectImage(image)}
                >
                  <img
                    src={`/img/${image}`}
                    alt={image}
                    className="w-10 h-10 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {formik.values.logo && (
            <div className="flex gap-4 mb-2">
              <label className="min-w-28 lg:w-52">Preview:</label>
              <img
                src={
                  typeof formik.values.logo === "object"
                    ? URL.createObjectURL(formik.values.logo)
                    : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${formik.values.logo}`
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
