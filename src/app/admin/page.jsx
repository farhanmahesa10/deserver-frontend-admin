"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../component/token/refreshToken";
import { IoEyeOutline, IoEyeOffOutline, IoCaretForward } from "react-icons/io5";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { useFormik } from "formik";
import { Toaster, toast } from "react-hot-toast";
import * as yup from "yup";
import Input from "../component/form/input";
import { Collapse } from "react-collapse";

export default function AddProfile({ params }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapseProfile, setCollapseProfile] = useState(false);
  const [collapsePassword, setCollapsePassword] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [isOpenVerify, setIsOpenVerify] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();

  //function untuk password terlihat atau tidak
  const onClickPassword = () => {
    setIsOpen(!isOpen);
  };
  const onClickUpdatePassword = () => {
    setUpdatePassword(!updatePassword);
  };
  const onClickVerifyPassword = () => {
    setIsOpenVerify(!isOpenVerify);
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
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            setIsLoading(false);
          });
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  const onSubmit = async (e) => {
    const handleError = async (error) => {
      if (error.response?.status === 401) {
        try {
          const newToken = await getNewAccessToken();
          localStorage.setItem("token", newToken);
          await handleSubmit(e);
        } catch (err) {
          console.error("Failed to refresh token:", err);
          alert("Session Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          router.push("/login");
        }
      } else {
        alert(error.response.data.message);
        setLoadingButton(false);
      }
    };

    try {
      const token = localStorage.getItem("token");

      setLoadingButton(true);
      const formData = new FormData();
      formData.append("outlet_name", formik.values.outlet_name);
      formData.append("email", formik.values.email);
      formData.append("role", formik.values.role);
      formData.append("password", formik.values.password);
      formData.append("verify_password", formik.values.varifyPassword);
      formData.append("address", formik.values.address);
      formData.append("history", formik.values.history);
      formData.append("logo", formik.values.logo);

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

      toast.success("update successfully!");
      setLoadingButton(false);
      router.push(`/admin`);
    } catch (error) {
      await handleError(error);
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
    validationSchema: yup.object({
      id: yup.string().notRequired(),
      outlet_name: yup.string().required(),
      email: yup.string().required(),
      password: yup.string().notRequired(),
      confirmationPassword: yup.string().when("password", {
        is: (password) => password,
        then: (schema) =>
          schema
            .required()
            .oneOf(
              [yup.ref("password")],
              "Password confirmation must be the same"
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
      varifyPassword: yup.string().when("password", {
        is: (password) => password,
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
            .required("Logo harus diunggah")
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
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
  });

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

  const iconEdit = () => {
    setIsEdit(!isEdit);
  };

  return (
    <div className="p-8 pt-24 w-full">
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-xl font-nunito text-center">Manage profile</h2>
      <div
        onClick={() => setCollapseProfile(!collapseProfile)}
        className="flex relative w-full justify-center bg-yellow-700   items-center px-4 py-2 border border-gray-300 rounded-t-md shadow-sm cursor-pointer  hover:bg-yellow-800 transition-all duration-300"
      >
        <h1 className="font-nunitoSans text-base text-white  ">Profile</h1>
        <IoCaretForward
          className={`text-white transition-transform duration-300 absolute right-1 ${
            collapseProfile ? "rotate-90" : ""
          }`}
        />
      </div>
      <Collapse isOpened={collapseProfile}>
        {isLoading ? (
          <EditDataSkeleton />
        ) : (
          <form
            className="mb-4 border p-8 grid gap-4 relative"
            onSubmit={formik.handleSubmit}
          >
            <button
              type="button"
              className="absolute right-3 top-2"
              onClick={iconEdit}
            >
              <HiMiniPencilSquare />
            </button>
            {formik.values.logo && (
              <div className="flex gap-4 mb-2">
                <label className={`${isEdit ? "hidden" : ""} min-w-28 lg:w-52`}>
                  Preview:
                </label>
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
            <div className={`${isEdit ? "hidden" : "flex"} gap-4 mb-2`}>
              <label htmlFor="logo" className="min-w-28 lg:w-52">
                {formik.values.logo ? "Update" : "Create"} logo:
              </label>
              <Input
                label={`${formik.values.logo ? "Update" : "Create"} logo:`}
                id="logo"
                placeholder="logo"
                name="logo"
                type="file"
                inputBorder="w-52"
                onChange={handleFileChange}
                errorMessage={formik.errors.logo}
                isError={
                  formik.touched.logo && formik.errors.logo ? true : false
                }
              />
            </div>
            <Input
              label="Outlet Name :"
              id="outlet_name"
              disabled={isEdit}
              placeholder="outlet_name"
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
              disabled={isEdit}
              value={formik.values.email}
              onChange={handleChange}
              errorMessage={formik.errors.email}
              isError={
                formik.touched.email && formik.errors.email ? true : false
              }
            />

            <Input
              label="Address :"
              id="address"
              placeholder="address"
              name="address"
              type="text"
              disabled={isEdit}
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
              disabled={isEdit}
              value={formik.values.history}
              onChange={handleChange}
              errorMessage={formik.errors.history}
              isError={
                formik.touched.history && formik.errors.history ? true : false
              }
            />

            <div
              className={`${
                isEdit ? "hidden" : "flex"
              } gap-8 text-white justify-end`}
            >
              <button
                type={loadingButton ? "button" : "submit"}
                className="bg-primary50 border-primary50 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
              >
                {loadingButton ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </Collapse>

      <div
        onClick={() => setCollapsePassword(!collapsePassword)}
        className="flex relative w-full justify-center bg-yellow-700  mt-5 items-center px-4 py-2 border border-gray-300 rounded-t-md shadow-sm cursor-pointer  hover:bg-yellow-800 transition-all duration-300"
      >
        <h1 className="font-nunitoSans text-base text-white">Password</h1>
        <IoCaretForward
          className={`text-white transition-transform duration-300 absolute right-1 ${
            collapsePassword ? "rotate-90" : ""
          }`}
        />
      </div>

      <Collapse isOpened={collapsePassword}>
        {isLoading ? (
          <EditDataSkeleton />
        ) : (
          <form
            className="mb-4 border p-8 grid gap-4 relative"
            onSubmit={formik.handleSubmit}
          >
            <Input
              label="New Password"
              type={`${!isOpen ? "password" : "text"}`}
              placeholder="*********"
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
              label="Confirmation Password"
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

            <Input
              label="Old Password"
              type={`${!isOpen ? "password" : "text"}`}
              placeholder="*********"
              id="varifyPassword"
              name="varifyPassword"
              value={formik.values.varifyPassword || ""}
              onChange={handleChange}
              rightIcon={isOpen ? <IoEyeOutline /> : <IoEyeOffOutline />}
              errorMessage={formik.errors.varifyPassword}
              isError={
                formik.touched.varifyPassword && formik.errors.varifyPassword
                  ? true
                  : false
              }
              onRightIconCLick={onClickVerifyPassword}
              rightIconClassName={"cursor-pointer"}
            />

            <div className={`flex gap-8 text-white justify-end`}>
              <button
                type={loadingButton ? "button" : "submit"}
                className="bg-primary50 border-primary50 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
              >
                {loadingButton ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </Collapse>
    </div>
  );
}
