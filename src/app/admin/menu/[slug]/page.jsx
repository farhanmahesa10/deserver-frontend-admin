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

export default function AddMenu({ params }) {
  const [role, setRole] = useState("");
  const [outlet, setOutlet] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);

  const router = useRouter();
  const { slug } = React.use(params);

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
          if (data.role === "admin") {
            if (slug == "edit") {
              formik.setFieldValue(outletName);
            }
          } else {
            formik.setFieldValue("outlet_name", data.outlet_name);
          }
          setRole(data.role);

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

  const onSubmit = async (e) => {
    const formData = new FormData();
    formData.append("id_subcategory", formik.values.id_subcategory);
    formData.append("title", formik.values.title);
    formData.append("price", formik.values.price);
    formData.append("details", formik.values.details);
    formData.append("status", formik.values.status);
    formData.append("best_seller", formik.values.best_seller);
    formData.append("photo", formik.values.photo);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formik.values.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/menu/update/${formik.values.id}`,
          formData,
          { headers }
        );
        localStorage.removeItem("id_menu");
        localStorage.removeItem("outlet_name");
        localStorage.setItem("newData", "update successfully!");
        router.push("/admin/menu");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/menu/create`,
          formData,
          { headers }
        );
        localStorage.setItem("newData", "create successfully!");
        router.push("/admin/menu");
      }
    } catch (error) {
      await handleApiError(error, onSubmit, router);
    }
  };

  const formik = useFormik({
    initialValues: {
      outlet_name: "",
      id_subcategory: "",
      title: "",
      price: "",
      details: "",
      status: "",
      best_seller: "",
      photo: "",
    },
    onSubmit,
    validationSchema: yup.object({
      // id_outlet: yup.string().required(),
      id_subcategory: yup.number().required(),
      title: yup.string().required(),
      price: yup.number().required(),
      details: yup.string().required(),
      status: yup.string().required(),
      best_seller: yup.string().required(),
      photo: yup.mixed().when("id", {
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

  //menampilkan semua sub category
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    const fetchData = async () => {
      if (formik.values.outlet_name) {
        try {
          // Mengambil data transaksi menggunakan axios dengan query params
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/showcafename/${formik.values.outlet_name}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data.data;

          setSubCategory(data);
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        }
      }
    };

    setIsLoading(false);

    fetchData();
  }, [formik.values.outlet_name]);

  console.log(subCategory);

  //MENAMPILKAN DATA MENU KETIKA EDIT
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const savedToken = localStorage.getItem("token");
          const idMenu = localStorage.getItem("id_menu");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/menu/showbyid/${idMenu}`,
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
    router.push("/admin/menu");
    localStorage.removeItem("id_menu");
    localStorage.removeItem("outlet_name");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

  // Handle pilihan gambar dari folder
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("photo", file);
  };
  return (
    <div className="p-8 pt-20 w-full">
      <h2 className="text-xl font-nunito">Manage menu</h2>
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
          {/* <div className={` flex gap-4 mb-2`}>
            <label htmlFor="id_subcategory" className="min-w-28 lg:w-52">
              Subcategory:
            </label>
            <select
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="id_subcategory"
              name="id_subcategory"
              value={menu.id_subcategory}
              onChange={handleChange}
            >
              <option value="" className="bg-primary50 " disabled>{`${
                slug == "create" ? "Select Subcategory Name" : menu.title
              }`}</option>
              {subCategory.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.title}
                </option>
              ))}
            </select>
          </div> */}

          <Select
            label="Subcategory:"
            id="id_subcategory"
            name="id_subcategory"
            value={formik.values.id_subcategory}
            options={subCategory.map((value) => (
              <option key={value.id} value={value.id}>
                {value.title}
              </option>
            ))}
            placeholder={"Select Subcategory Name"}
            onChange={handleChange}
            errorMessage={formik.errors.id_subcategory}
            isError={
              formik.touched.id_subcategory && formik.errors.id_subcategory
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
          <Input
            label="Details :"
            id="details"
            placeholder="details"
            name="details"
            type="text"
            value={formik.values.details}
            onChange={handleChange}
            errorMessage={formik.errors.details}
            isError={
              formik.touched.details && formik.errors.details ? true : false
            }
          />

          <Input
            label="Price :"
            id="price"
            placeholder="price"
            name="price"
            type="number"
            value={formik.values.price}
            onChange={handleChange}
            errorMessage={formik.errors.price}
            isError={formik.touched.price && formik.errors.price ? true : false}
          />
          {/* <div className="flex gap-4 mb-2">
            <label htmlFor="status" className="min-w-28 lg:w-52">
              status:
            </label>
            <select
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="status"
              name="status"
              value={menu.status}
              onChange={handleChange}
            >
              <option value="" disabled>{`${
                slug == "create" ? "is the product available?" : menu.status
              }`}</option>
              <div>
                <option>ready</option>
                <option>soldOut</option>
              </div>
            </select>
          </div> */}
          <Select
            label="Status :"
            id="status"
            name="status"
            value={formik.values.status}
            options={["Ready", "SoldOut"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
            placeholder={"is the product available?"}
            onChange={handleChange}
            errorMessage={formik.errors.status}
            isError={
              formik.touched.status && formik.errors.status ? true : false
            }
          />
          {/* <div className="flex gap-4 mb-2">
            <label htmlFor="best_seller" className="min-w-28 lg:w-52">
              best_seller:
            </label>
            <select
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="best_seller"
              name="best_seller"
              value={menu.best_seller}
              onChange={handleChange}
            >
              <option value="" disabled>{`${
                slug == "create" ? "Is this a best seller?" : menu.best_seller
              }`}</option>
              <option>true</option>
              <option>false</option>
            </select>
          </div> */}
          <Select
            label="Best_seller :"
            id="best_seller"
            name="best_seller"
            value={formik.values.best_seller}
            options={["true", "false"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
            placeholder={"is the product available?"}
            onChange={handleChange}
            errorMessage={formik.errors.best_seller}
            isError={
              formik.touched.best_seller && formik.errors.best_seller
                ? true
                : false
            }
          />
          <div className="flex gap-4 mb-2">
            <Input
              label="Photo :"
              id="photo"
              placeholder="photo"
              name="photo"
              type="file"
              inputBorder="w-52"
              onChange={handleFileChange}
              errorMessage={formik.errors.photo}
              isError={
                formik.touched.photo && formik.errors.photo ? true : false
              }
            />
          </div>
          {formik.values.photo && (
            <div className="flex gap-4 mb-2">
              <label className="min-w-28 lg:w-52">Preview:</label>
              <img
                src={
                  typeof formik.values.photo === "object"
                    ? URL.createObjectURL(formik.values.photo)
                    : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${formik.values.photo}`
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
