"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../../../component/refreshToken/refreshToken";
import ButtonCreateUpdate from "@/app/component/button/button";
import { Formik, useFormik } from "formik";
import * as yup from "yup";
import Input from "@/app/component/form/input";
import Select from "@/app/component/form/select";

export default function AddProfile({ params }) {
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenVerify, setIsOpenVerify] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        alert(error.response.data.message);
        setLoadingButton(false);
      }
    };

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
        alert("Data berhasil diperbarui!");
        router.push(`/admin/outlet`);
      } else {
        setLoadingButton(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/create`,
          formData,
          { headers }
        );
        alert("Data berhasil diperbarui!");
        router.push(`/admin/outlet`);
      }
    } catch (error) {
      await handleError(error);
    }
  };

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
              router.push(`/admin`);
            }
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  const formik = useFormik({
    initialValues: {
      id: "",
      outlet_name: "",
      email: "",
      password: "",
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
      password: yup.string().notRequired(), // Tidak wajib saat edit
      varifyPassword: yup.string().notRequired(),
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

  //CARI DATA BERDASARKAN ID KETIKA EDIT
  useEffect(() => {
    if (slug === "edit") {
      setIsLoading(true);
      const fetchData = async () => {
        try {
          const idOutlet = localStorage.getItem("id_outlet");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/showprofile/${idOutlet}`
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
            varifyPassword: "",
          });
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, []);

  // const createProfile = async (e, idOutlet) => {
  //   e.preventDefault();
  //   const formDataProfile = {
  //     id_outlet: idOutlet,
  //   };

  //   const handleError = async (error) => {
  //     if (error.response?.status === 401) {
  //       try {
  //         const newToken = await getNewAccessToken();
  //         localStorage.setItem("token", newToken); // Simpan token baru
  //         await createProfile(e); // Ulangi proses dengan token baru
  //       } catch (err) {
  //         console.error("Failed to refresh token:", err);
  //         alert("Session Anda telah berakhir. Silakan login ulang.");
  //         localStorage.clear();
  //         router.push("/login");
  //       }
  //     } else {
  //       console.error("Error deleting contact:", error);
  //     }
  //   };

  //   try {
  //     const token = localStorage.getItem("token");
  //     const headers = { Authorization: `Bearer ${token}` };

  //     setLoadingButton(true);

  //     // Mengirim formData ke API pemesanan
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/profile/create`,
  //       formDataProfile,
  //       { headers }
  //     );
  //     alert("Data berhasil ditambahkan!");
  //     router.push(`/admin/outlet`);
  //     setLoadingButton(false);
  //   } catch (error) {
  //     await handleError(error);
  //   }
  // };

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
          {/* <div className="flex gap-4 mb-2">
            <label htmlFor="outlet_name" className="min-w-28 lg:w-52">
              Outlet Name:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="outlet_name"
              placeholder="outlet name"
              type="text"
              name="outlet_name"
              value={outlet.outlet_name}
              onChange={handleChange}
              required
            />
          </div> */}

          <Input
            label="Outlet Name :"
            id="outlet_name"
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

          {/* <div className="flex gap-4 mb-2">
            <label htmlFor="email" className="min-w-28 lg:w-52">
              Email:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="email"
              placeholder="email"
              type="text"
              name="email"
              value={outlet.email}
              onChange={handleChange}
              required
            />
          </div> */}

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

          {/* <div className="flex gap-4 mb-2">
            <label htmlFor="role" className="min-w-28 lg:w-52">
              Role:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="role"
              placeholder="role"
              type="text"
              name="role"
              value={outlet.role}
              onChange={handleChange}
              required
            />
          </div> */}

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
            onRightIconCLick={onClickPassword}
            rightIconClassName={"cursor-pointer"}
          />

          {/* <div className="flex gap-4 mb-2">
            <label htmlFor="address" className={` min-w-28 lg:w-52`}>
              Address:
            </label>
            <input
              className={` border p-1 rounded-lg border-primary50 w-full h-8`}
              id="address"
              placeholder="Address"
              type="text"
              name="address"
              value={outlet.address}
              onChange={handleChange}
            />
          </div> */}

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

          {/* <div className="flex gap-4 mb-2">
            <label htmlFor="history" className={` min-w-28 lg:w-52`}>
              History:
            </label>
            <input
              className={` border p-1 rounded-lg border-primary50 w-full h-8`}
              id="history"
              placeholder="history"
              type="text"
              name="history"
              value={outlet.history}
              onChange={handleChange}
            />
          </div> */}

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
            <label htmlFor="logo" className={` min-w-28 lg:w-52`}>
              logo:
            </label>
            <input
              className={`border rounded-lg border-primary50 w-full h-8`}
              id="logo"
              type="file"
              name="logo"
              onChange={handleFileChange}
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
