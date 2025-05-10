"use client";

import React, { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useFormik } from "formik";
import * as yup from "yup";
import Input from "../component/form/input";
import { useDispatch } from "react-redux";
import { setOutlet } from "@/store/slice";
import instance from "../component/api/api";

export default function Login() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [msgError, setMsgError] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  //function untuk password terlihat atau tidak
  const onClickPassword = () => {
    setIsOpen(!isOpen);
  };

  //handle untuk login
  const onSubmit = async () => {
    setLoadingButton(true);
    try {
      const response = await instance.post(`/api/v1/login`, formik.values);

      if (response.status === 200) {
        const token = response.data.AccessToken;
        const refreshToken = response.data.refreshToken;
        const outlet_id = response.data.curroutlet;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        try {
          const response = await instance.get(
            `/api/v1/outlet/show/${outlet_id}`
          );
          const data = response.data.data;
          dispatch(setOutlet(data));

          router.push("/");
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      setMsgError("Incorrect email or password!");
      setLoadingButton(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit,
    validationSchema: yup.object({
      email: yup.string().email("Invalid email").required("Email is required"),
      password: yup.string().required("Password is required"),
    }),
  });

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { target } = e;
    formik.setFieldValue(target.name, target.value);
  };

  return (
    <section id="login">
      <div className="p-4 sm:p-8 md:px-20 lg:px-44 md:pt-8 md:pb-40 grid justify-center font-nunito">
        {/* <Toaster position="top-center" reverseOrder={false} /> */}
        <form onSubmit={formik.handleSubmit}>
          <div className="w-[277px] max-w-sm md:max-w-md lg:max-w-lg py-8 px-8 bg-white shadow-lg border-[1px]  rounded-lg md:w-[398px]">
            <div className=" p-1 w-20 h-10 md:w-28 md:h-16 mx-auto ">
              <img
                src={`/img/logo.png`}
                className="w-full h-full object-contain"
                alt="Logo"
              />
            </div>
            <h1 className="text-center font-ubuntu mobile-h4 mb-8">D-SERVE</h1>
            <div className="mb-6">
              <Input
                label="Email"
                type="text"
                placeholder="masukan email"
                id="email"
                name="email"
                onChange={handleChange}
                errorMessage={formik.errors.email}
                isError={
                  formik.touched.email && formik.errors.email ? true : false
                }
              />
            </div>

            <Input
              label="Password"
              type={`${!isOpen ? "password" : "text"}`}
              placeholder="*********"
              id="password"
              name="password"
              onChange={handleChange}
              rightIcon={isOpen ? <IoEyeOutline /> : <IoEyeOffOutline />}
              errorMessage={formik.errors.password}
              isError={
                formik.touched.password && formik.errors.password ? true : false
              }
              onRightIconCLick={onClickPassword}
              rightIconClassName={"cursor-pointer"}
            />
            <div className="w-full mt-14 ">
              <button
                type="submit"
                disabled={loadingButton}
                className={`${
                  loadingButton ? "bg-gray-400" : "bg-yellow-700"
                } font-ubuntu mobile-h4  text-white  py-3 px-8 rounded-md w-full hover:opacity-80 hover:shadow-lg transition duration-500`}
              >
                {loadingButton ? "Loading..." : "Login"}
              </button>
              <h1 className="text-xs text-center text-red-600">{msgError}</h1>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
