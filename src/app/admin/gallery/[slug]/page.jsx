"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../adminSkeleton/editDataSkeleton";
import { getNewAccessToken } from "../../refreshToken";

export default function AddGallery({ params }) {
  const [gallery, setGallery] = useState({
    id_outlet: "",
    title: "",
  });
  const [outlet, setOutlet] = useState([]);
  const [role, setRole] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
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
            const data = response.data;
            setRole(data.role);
            if (data.role !== "admin") {
              setGallery((gallery) => ({
                ...gallery,
                id_outlet: data.id,
              }));
            }
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    } else {
      router.push(`/login`);
    }
  }, [router]);

  //menampilkan semua DATA OUTLET
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        // Mengambil data transaksi menggunakan axios dengan query params
        const response = await axios.get(
          ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show`
        );

        const data = response.data;

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

          const data = response.data;
          setGallery(data);

          setSelectedFile(data.image);
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

  //handle edit dan create
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gallery.title) {
      alert("Harap isi semua field!");
      return;
    }

    const formData = new FormData();
    formData.append("id_outlet", gallery.id_outlet);
    formData.append("title", gallery.title);

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (gallery.image) {
      formData.append("image", gallery.image);
    }
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

      if (gallery.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/gallery/update/${gallery.id}`,
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

  const handleCancel = () => {
    router.push("/admin/gallery");
    localStorage.removeItem("id_gallery");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGallery((gallery) => ({
      ...gallery,
      [name]: value,
    }));
  };

  // Handle pilihan gambar dari folder
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
      <h2 className="text-xl font-nunito">Manage gallery</h2>
      {isLoading ? (
        <EditDataSkeleton />
      ) : (
        <form className="mt-4 border p-8 grid gap-4" onSubmit={handleSubmit}>
          <div className={`${role !== "admin" ? "hidden" : "flex"} gap-4 mb-2`}>
            <label htmlFor="id_outlet" className="min-w-28 lg:w-52">
              Outlate Name:
            </label>
            <select
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="id_outlet"
              name="id_outlet"
              value={gallery.id_outlet}
              onChange={handleChange}
            >
              <option
                value=""
                className="bg-primary50 font-semibold text-black"
                disabled
              >{`${
                slug == "create" ? "Select Outlet Name" : "Select Outlet Name"
              }`}</option>
              {outlet.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.outlet_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mb-2">
            <label htmlFor="title" className="min-w-28 lg:w-52">
              title:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="title"
              placeholder="title"
              type="text"
              name="title"
              value={gallery.title}
              onChange={handleChange}
              required
            />
          </div>

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
          {(selectedFile || gallery.image) && (
            <div className="flex gap-4 mb-2">
              <label className="min-w-28 lg:w-52">Preview:</label>
              <img
                src={
                  slug === "create"
                    ? URL.createObjectURL(selectedFile)
                    : gallery.image !== selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : `${process.env.NEXT_PUBLIC_BASE_API_URL}/${gallery.image}`
                }
                alt="event Preview"
                className="mx-auto w-40 h-40 object-cover"
              />
            </div>
          )}
          <div className="flex gap-8 text-white justify-end">
            <button
              type={loadingButton ? "button" : "submit"}
              className="bg-primary50 border-primary50 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
            >
              {loadingButton ? "Loading..." : "Submit"}
            </button>
            <button
              type="button"
              className="bg-red-500 border-red-5bg-red-500 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
