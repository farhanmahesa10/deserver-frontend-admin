"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import ButtonCreateUpdate from "@/app/component/button/button";
import { useFormik } from "formik";
import * as yup from "yup";
import Input from "@/app/component/form/input";
import Select from "@/app/component/form/select";
import { handleApiError } from "@/app/component/handleError/handleError";

export default function AddProfile({ params }) {
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenVerify, setIsOpenVerify] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const { slug } = React.use(params);

  //function untuk password terlihat atau tidak
  const onClickPassword = () => {
    setIsOpen(!isOpen);
  };
  const onClickVerifyPassword = () => {
    setIsOpenVerify(!isOpenVerify);
  };

  const onSubmit = async (e) => {
    const formData = new FormData();
    formData.append("outlet_name", formik.values.outlet_name);
    formData.append("email", formik.values.email);
    formData.append("role", formik.values.role);
    formData.append("password", formik.values.password);
    formData.append("verify_password", formik.values.varifyPassword);
    formData.append("address", formik.values.address);
    formData.append("history", formik.values.history);
    formData.append("logo", formik.values.logo);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (formik.values.id) {
        setLoadingButton(true);

        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/update/${formik.values.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        localStorage.removeItem("id_outlet");
        localStorage.setItem("newData", "updated successfully!");
        router.push(`/admin/outlet`);
      } else {
        setLoadingButton(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/create`,
          formData,
          { headers }
        );
        localStorage.setItem("newData", "created successfully!");
        router.push(`/admin/outlet`);
      }
    } catch (error) {
      await handleApiError(error, onSubmit, router);
    }
  };

  const formik = useFormik({
    initialValues: {
      id: "",
      outlet_name: "",
      email: "",
      password: "",
      confirmationPassword: "",
      varifyPassword: "",
      role: "",
      address: "",
      history: "",
      logo: "",
    },
    onSubmit,
    validationSchema: yup.object().shape({
      id: yup.string().notRequired(),
      outlet_name: yup.string().required(),
      email: yup.string().required(),
      password: yup.string().when("id", {
        is: (id) => !id,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
      confirmationPassword: yup.string().when(["id", "password"], {
        is: (id, password) => !id || password,
        then: (schema) =>
          schema
            .required()
            .oneOf(
              [yup.ref("password")],
              "Password confirmation must be the same"
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
      varifyPassword: yup.string().when(["id", "password"], {
        is: (id, password) => id && password,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
      role: yup.string().required(),
      address: yup.string().required(),
      history: yup.string().required(),
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

          if (data.role !== "admin") {
            router.push("/admin");
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
  //CARI DATA BERDASARKAN ID KETIKA EDIT
  useEffect(() => {
    if (slug === "edit") {
      const token = localStorage.getItem("token");
      setIsLoading(true);
      const fetchData = async () => {
        try {
          const idOutlet = localStorage.getItem("id_outlet");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${idOutlet}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data.data;
          formik.setValues({
            id: data.id,
            outlet_name: data.outlet_name,
            email: data.email,
            role: data.role,
            address: data.address,
            history: data.history,
            logo: data.logo,
            password: "",
            confirmationPassword: "",
            varifyPassword: "",
          });
          setIsLoading(false);
        } catch (error) {
          await handleApiError(error, fetchData, router);
        }
      };
      fetchData();
    }
  }, []);

  const handleCancel = () => {
    router.push("/admin/outlet");
    localStorage.removeItem("id_outlet");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

  // Handle pilihan gambar dari folder
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("logo", file);
  };

  return (
    <div className="p-8 pt-20 w-full">
      <h2 className="text-xl font-nunito">Manage Outlet</h2>

      {isLoading ? (
        <EditDataSkeleton />
      ) : (
        <form
          className="mt-4 border p-8 grid gap-4"
          onSubmit={formik.handleSubmit}
        >
          <Input
            label="Outlet Name :"
            id="outlet_name"
            placeholder="outlet name"
            name="outlet_name"
            type="text"
            value={formik.values.outlet_name}
            onChange={handleChange}
            errorMessage={formik.errors.outlet_name}
            isError={
              formik.touched.outlet_name && formik.errors.outlet_name
                ? true
                : false
            }
          />

          <Input
            label="Email :"
            id="email"
            placeholder="email"
            name="email"
            type="text"
            value={formik.values.email}
            onChange={handleChange}
            errorMessage={formik.errors.email}
            isError={formik.touched.email && formik.errors.email ? true : false}
          />

          <Select
            label="Role :"
            id="role"
            name="role"
            value={formik.values.role}
            options={["admin", "user"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
            placeholder={"Role?"}
            onChange={handleChange}
            errorMessage={formik.errors.role}
            isError={formik.touched.role && formik.errors.role ? true : false}
          />

          <Input
            label={`${slug == "create" ? "Password" : "New Password"}`}
            type={`${!isOpen ? "password" : "text"}`}
            placeholder={`${
              slug == "create"
                ? "*********"
                : "leave blank if you don't want to change the password"
            }`}
            id="password"
            name="password"
            value={formik.values.password}
            onChange={handleChange}
            rightIcon={isOpen ? <IoEyeOutline /> : <IoEyeOffOutline />}
            errorMessage={formik.errors.password}
            isError={
              formik.touched.password && formik.errors.password ? true : false
            }
            onRightIconCLick={onClickPassword}
            rightIconClassName={"cursor-pointer"}
          />
          <Input
            label={`${
              slug == "create"
                ? "Confirmation Password"
                : "Confirmation New Password"
            }`}
            type={`${!isOpen ? "password" : "text"}`}
            placeholder="*********"
            id="confirmationPassword"
            name="confirmationPassword"
            value={formik.values.confirmationPassword}
            onChange={handleChange}
            rightIcon={isOpen ? <IoEyeOutline /> : <IoEyeOffOutline />}
            errorMessage={formik.errors.confirmationPassword}
            isError={
              formik.touched.confirmationPassword &&
              formik.errors.confirmationPassword
                ? true
                : false
            }
            onRightIconCLick={onClickPassword}
            rightIconClassName={"cursor-pointer"}
          />

          <div className={`${slug === "create" ? "hidden" : " "}`}>
            <Input
              label="Verify Old Password"
              type={`${!isOpenVerify ? "password" : "text"}`}
              placeholder="*********"
              id="varifyPassword"
              name="varifyPassword"
              value={formik.values.varifyPassword || ""}
              onChange={handleChange}
              rightIcon={isOpenVerify ? <IoEyeOutline /> : <IoEyeOffOutline />}
              errorMessage={formik.errors.varifyPassword}
              isError={
                formik.touched.varifyPassword && formik.errors.varifyPassword
                  ? true
                  : false
              }
              onRightIconCLick={onClickVerifyPassword}
              rightIconClassName={"cursor-pointer"}
            />
          </div>

          <Input
            label="Address :"
            id="address"
            placeholder="address"
            name="address"
            type="text"
            value={formik.values.address}
            onChange={handleChange}
            errorMessage={formik.errors.address}
            isError={
              formik.touched.address && formik.errors.address ? true : false
            }
          />

          <Input
            label="History :"
            id="history"
            placeholder="history"
            name="history"
            type="text"
            value={formik.values.history}
            onChange={handleChange}
            errorMessage={formik.errors.history}
            isError={
              formik.touched.history && formik.errors.history ? true : false
            }
          />

          <div className="flex gap-4 mb-2">
            <Input
              label="Logo :"
              id="logo"
              placeholder="logo"
              name="logo"
              type="file"
              inputBorder="w-52"
              onChange={handleFileChange}
              errorMessage={formik.errors.logo}
              isError={formik.touched.logo && formik.errors.logo ? true : false}
            />
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
