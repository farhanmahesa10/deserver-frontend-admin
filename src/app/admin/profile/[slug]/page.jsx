"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../../../component/refreshToken/refreshToken";
import ButtonCreateUpdate from "@/app/component/button/button";

export default function AddProfile({ params }) {
  const [profile, setProfile] = useState({
    cafe_name: "",
    address: "",
    history: "",
  });
  const [outlet, setOutlet] = useState({
    outlet_name: "",
    email: "",
    role: "",
  });
  const [verifikasiPassword, setVerifikasiPassword] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [outletId, setOutletId] = useState(16);
  const [role, setRole] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const router = useRouter();
  const { slug } = React.use(params);

  //function untuk password terlihat atau tidak
  const onClickPassword = () => {
    setIsOpen(!isOpen);
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
            setRole(data.role);
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  //CARI DATA OUTLET BERDASARKAN ID KETIKA EDIT
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outletId}`
          );

          const data = response.data;
          setOutlet(data);

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [outletId]);

  //CARI DATA BERDASARKAN ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idProfile = localStorage.getItem("id_profile");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/profile/show/${idProfile}`
          );

          const data = response.data;
          setProfile(data);

          setSelectedFile(data.logo);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id_outlet", outletId);
    formData.append("cafe_name", profile.cafe_name);
    formData.append("address", profile.address);
    formData.append("history", profile.history);

    if (selectedFile) {
      formData.append("logo", selectedFile);
    } else if (profile.logo) {
      formData.append("logo", profile.logo);
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      setLoadingButton(true);

      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/profile/update/${profile.id}`,
        formData,
        { headers }
      );
      alert("Data berhasil diperbarui!");
      localStorage.removeItem("id_profile");
      router.push("/admin");
      setLoadingButton(false);
    } catch (error) {
      if (error.response.status === 401) {
        try {
          const token = await getNewAccessToken();
          const headersWithNewToken = { Authorization: `Bearer ${token}` };

          setLoadingButton(true);

          await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/profile/update/${profile.id}`,
            formData,
            { headers: headersWithNewToken }
          );
          alert("Data berhasil diperbaruiiiiii!");
          localStorage.removeItem("id_profile");
          router.push("/admin");
          setLoadingButton(false);
        } catch (error) {
          console.error("Gagal memperbarui token:", error);
          alert("Session Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          router.push("/login");
        }
      } else {
        console.log(error);
      }
    }
  };

  const handleCancel = () => {
    router.push("/admin");
    localStorage.removeItem("id_profile");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((profile) => ({
      ...profile,
      [name]: value,
    }));
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
          <div className="flex gap-4 mb-2">
            <label htmlFor="outlet_name" className="min-w-28 lg:w-52">
              outlet_name:
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
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="password" className="min-w-28 lg:w-52">
              Password:
            </label>
            <div className="w-full flex text-dark text-sm rounded-md border p-1 border-primary50">
              <input
                className=" focus:outline-none  rounded-lg  w-full h-6"
                id="password"
                placeholder="password"
                type={`${!isOpen ? "password" : "text"}`}
                name="password"
                value={password}
                onChange={handleChange}
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
          <div className="flex gap-4 mb-2">
            <label htmlFor="verifikasiPassword" className="min-w-28 lg:w-52">
              Verifikasi Password:
            </label>
            <div className="w-full flex text-dark text-sm rounded-md border p-1 border-primary50">
              <input
                className=" focus:outline-none  rounded-lg  w-full h-6"
                id="verifikasiPassword"
                placeholder="verifikasiPassword"
                type={`${!isOpen ? "password" : "text"}`}
                name="verifikasiPassword"
                value={verifikasiPassword}
                onChange={(e) => setVerifikasiPassword(e.target.value)}
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

          <div className="border my-4  w-full"></div>

          <div className="flex gap-4 mb-2">
            <label htmlFor="cafe_name" className="min-w-28 lg:w-52">
              Cafe_name:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="cafe_name"
              placeholder="cafe_name"
              type="text"
              name="cafe_name"
              value={profile.cafe_name}
              onChange={handleChange}
              required
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
              name="address"
              value={profile.address}
              onChange={handleChange}
              required
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
              name="history"
              value={profile.history}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="logo" className="min-w-28 lg:w-52">
              logo:
            </label>
            <input
              className="border rounded-lg border-primary50 w-full h-8"
              id="logo"
              type="file"
              name="logo"
              onChange={handleFileChange}
            />
          </div>
          {(selectedFile || profile.logo) && (
            <div className="flex gap-4 mb-2">
              <label className="min-w-28 lg:w-52">Preview:</label>
              <img
                src={
                  slug === "create"
                    ? URL.createObjectURL(selectedFile)
                    : profile.logo !== selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : `${process.env.NEXT_PUBLIC_BASE_API_URL}/${profile.logo}`
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
