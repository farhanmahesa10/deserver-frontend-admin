"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
// import { Toaster, toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [login, setLogin] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [msgError, setMsgError] = useState(false);
  const router = useRouter();

  //function untuk password terlihat atau tidak
  const onClickPassword = () => {
    setIsOpen(!isOpen);
  };

  //handle email dan password
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogin({ ...login, [name]: value });
  };

  //handle untuk login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingButton(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/login`,
        login
      );

      const token = response.data.accessToken;
      const refreshToken = response.data.refreshToken;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      const decoded = jwtDecode(token);
      const outlet_id = decoded.id;

      //request ke api agar mengaetahui role nya admin atau user
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outlet_id}`
        )
        .then((response) => {
          const data = response.data;

          if (data.role === "admin") {
            router.push("/");
          } else {
            router.push("/");
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } catch (error) {
      setMsgError("email atau password salah!");
    } finally {
      setLoadingButton(false);
    }
  };

  return (
    <section id="login">
      <div className="p-4 sm:p-8 md:px-20 lg:px-44 md:pt-8 md:pb-40 grid justify-center">
        {/* <Toaster position="top-center" reverseOrder={false} /> */}
        <form>
          <div className="w-[277px] max-w-sm md:max-w-md lg:max-w-lg py-8 px-8 bg-white shadow-lg border-[1px]  rounded-lg md:w-[398px]">
            <h1 className="text-center mobile-h4 mb-8">Masuk</h1>
            <div className="w-full px-4 mb-4">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                type="text"
                placeholder="masukan email"
                id="email"
                name="email"
                onChange={handleChange}
                className="w-full text-dark text-xs p-3 rounded-md focus:outline-none border border-primary"
                required
              />
            </div>
            <div className="w-full px-4 mb-4">
              <label htmlFor="katasandi" className="text-sm">
                Katasandi
              </label>
              <div className="w-full flex text-dark text-sm p-3 rounded-md border border-primary">
                <input
                  type={`${!isOpen ? "password" : "text"}`}
                  id="password"
                  name="password"
                  onChange={handleChange}
                  className="w-full text-xs focus:outline-none"
                  placeholder="*********"
                  required
                />
                <div
                  onClick={onClickPassword}
                  className="self-center cursor-pointer"
                >
                  <div
                    className={`${
                      isOpen ? "absolute" : " hidden"
                    } bg-slate-700 w-4 h-[2px] -rotate-45 mt-1`}
                  ></div>
                  <img src="/img/mata.png" alt="visibility" className="" />
                </div>
              </div>
            </div>
            <div className="w-full px-4 mb-4 ">
              <button
                onClick={handleSubmit}
                disabled={loadingButton}
                className="text-base bg-yellow-700 text-white  py-3 px-8 rounded-md w-full hover:opacity-80 hover:shadow-lg transition duration-500"
              >
                {loadingButton ? "Loading..." : "Masuk"}
              </button>
              <h1 className="text-xs text-center text-red-600">{msgError}</h1>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
