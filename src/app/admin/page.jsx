"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../component/refreshToken/refreshToken";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";

export default function AddProfile({ params }) {
  const [outlet, setOutlet] = useState({
    outlet_name: "",
    email: "",
    role: "",
    profile: {
      cafe_name: "",
      address: "",
      history: "",
      logo: "",
    },
  });
  const [verifikasiPassword, setVerifikasiPassword] = useState("");
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [outletId, setOutletId] = useState("");
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
            const data = response.data;
            setOutletId(data.id);
            if (data.role === "admin") {
              router.push(`/admin/outlet`);
            }
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  //CARI DATA BERDASARKAN ID KETIKA EDIT
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (outletId) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/showprofile/${outletId}`
          );

          const data = response.data;
          setOutlet(data);

          setSelectedFile(data.profile.logo);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [outletId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataOutlet = {
      outlet_name: outlet.outlet_name,
      email: outlet.email,
      role: outlet.role,
      password: password,
      verify_password: verifikasiPassword,
    };

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
      Object.keys(formDataOutlet).forEach((key) => {
        formData.append(key, formDataOutlet[key]);
      });
      formData.append("cafe_name", outlet.profile.cafe_name);
      formData.append("address", outlet.profile.address);
      formData.append("history", outlet.profile.history);

      if (selectedFile) {
        formData.append("logo", selectedFile);
      } else if (outlet.profile.logo) {
        formData.append("logo", outlet.profile.logo);
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/profile/updateprofileoutlet/${outlet.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Data berhasil diperbarui!");
      setLoadingButton(false);
      router.push(`/admin`);
    } catch (error) {
      await handleError(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Periksa apakah field berasal dari profile
    if (name.startsWith("profile.")) {
      const field = name.split(".")[1]; // Ambil nama field dalam profile
      setOutlet((prevState) => ({
        ...prevState,
        profile: {
          ...prevState.profile,
          [field]: value,
        },
      }));
    } else {
      // Untuk field di luar profile
      setOutlet((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar (maksimal 2MB)!");
      return;
    }
    setSelectedFile(file);
  };

  return (
    <div className="p-8 pt-20 w-full">
      <h2 className="text-xl font-nunito">Manage profile</h2>
      {isLoading ? (
        <EditDataSkeleton />
      ) : (
        <form className="mt-4 border p-8 grid gap-4" onSubmit={handleSubmit}>
          {(selectedFile || outlet.profile.logo) && (
            <div className="flex gap-4 mb-2">
              <img
                src={
                  selectedFile instanceof File
                    ? URL.createObjectURL(selectedFile)
                    : outlet.profile.logo
                    ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/${outlet.profile.logo}`
                    : null
                }
                alt="Event Preview"
                className="mx-auto w-40 h-40 object-cover"
              />
            </div>
          )}
          <div className="flex gap-4 mb-2">
            <label htmlFor="logo" className="min-w-28 lg:w-52">
              {outlet.profile.logo ? "Update" : "Create"} logo:
            </label>
            <input
              className="border rounded-lg border-primary50 w-full h-8"
              id="logo"
              type="file"
              name="logo"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="outlet_name" className="min-w-28 lg:w-52">
              Outlet Name:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="outlet_name"
              placeholder="outlet_name"
              type="text"
              name="outlet_name"
              value={outlet.outlet_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex gap-4 mb-2">
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
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="password" className="min-w-28 lg:w-52">
              New Password:
            </label>
            <div className="w-full flex text-dark text-sm rounded-md border p-1 border-primary50">
              <input
                className=" focus:outline-none  rounded-lg  w-full h-6"
                id="password"
                placeholder="Enter a new password "
                type={`${!isOpen ? "password" : "text"}`}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <div className="flex gap-4 mb-2">
            <label htmlFor="verifikasiPassword" className="min-w-28 lg:w-52">
              Old Password:
            </label>
            <div className="w-full flex text-dark text-sm rounded-md border p-1 border-primary50">
              <input
                className=" focus:outline-none  rounded-lg  w-full h-6"
                id="verifikasiPassword"
                placeholder="Enter a old password"
                type={`${!isOpenVerify ? "password" : "text"}`}
                name="verifikasiPassword"
                value={verifikasiPassword}
                onChange={(e) => setVerifikasiPassword(e.target.value)}
              />
              <div
                onClick={onClickVerifyPassword}
                className="self-center cursor-pointer"
              >
                <div
                  className={`${
                    isOpenVerify ? "absolute" : " hidden"
                  } bg-slate-700 w-4 h-[2px] -rotate-45 mt-1`}
                ></div>
                <img src="/img/mata.png" alt="visibility" className="" />
              </div>
            </div>
          </div>

          <div className="border my-4  w-full"></div>

          <div className="flex gap-4 mb-2">
            <label htmlFor="cafe_name" className="min-w-28 lg:w-52">
              Cafe Name:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="cafe_name"
              placeholder="cafe name"
              type="text"
              name="profile.cafe_name"
              value={outlet.profile.cafe_name ? outlet.profile.cafe_name : ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="address" className="min-w-28 lg:w-52">
              Address:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="address"
              placeholder="Address"
              type="text"
              name="profile.address"
              value={outlet.profile.address ? outlet.profile.address : ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="history" className="min-w-28 lg:w-52">
              History:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="history"
              placeholder="history"
              type="text"
              name="profile.history"
              value={outlet.profile.history ? outlet.profile.history : ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-8 text-white justify-end">
            <button
              type={loadingButton ? "button" : "submit"}
              className="bg-primary50 border-primary50 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
            >
              {loadingButton ? "Loading..." : "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
