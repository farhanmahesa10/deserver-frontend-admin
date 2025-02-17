"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../../component/skeleton/editDataSkeleton";
import { getNewAccessToken } from "../../../component/refreshToken/refreshToken";

export default function AddsubCategory({ params }) {
  const [subCategory, setSubCategory] = useState({
    id_category: "",
    title: "",
  });
  const [category, setCategory] = useState([]);
  const [outlet, setOutlet] = useState([]);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [outletName, setoutletName] = useState("");
  const router = useRouter();
  const { slug } = React.use(params);

  // cek token
  useEffect(() => {
    const savedToken = localStorage.getItem("refreshToken");
    const outletName = localStorage.getItem("outlet_name");

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
            if (data.role === "admin") {
              if (slug == "edit") {
                setoutletName(outletName);
              }
            } else {
              setoutletName(data.outlet_name);
            }
            setRole(data.role);
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

  //menampilkan data category
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      if (outletName) {
        try {
          // Mengambil data transaksi menggunakan axios dengan query params
          const response = await axios.get(
            ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/category/showcafename/${outletName}`
          );

          const data = response.data;

          setCategory(data);
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        }
      }
    };

    setIsLoading(false);

    fetchData();
  }, [outletName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const savedToken = localStorage.getItem("token");
          const idsubCategory = localStorage.getItem("id_subCategory");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/showbyid/${idsubCategory}`
          );

          const data = response.data;
          setSubCategory(data[0]);

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

    if (!subCategory.title || !subCategory.id_category) {
      alert("Harap isi semua field!");
      return;
    }

    const formData = {
      id_category: subCategory.id_category,
      title: subCategory.title,
    };

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
        console.error("Error deleting contact:", error);
      }
    };

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (subCategory.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/update/${subCategory.id}`,
          formData,
          { headers }
        );
        localStorage.removeItem("id_subCategory");
        localStorage.removeItem("outlet_name");
        alert("Data berhasil diperbarui!");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/subcategory/create`,
          formData,
          { headers }
        );
        alert("Data berhasil ditambahkan!");
      }

      router.push("/admin/subCategory");
      setLoadingButton(false);
    } catch (error) {
      await handleError(error);
    }
  };

  const handleCancel = () => {
    router.push("/admin/subCategory");
    localStorage.removeItem("id_subCategory");
    localStorage.removeItem("outlet_name");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubCategory((subCategory) => ({
      ...subCategory,
      [name]: value,
    }));
  };

  return (
    <div className="p-8 pt-20 w-full">
      <h2 className="text-xl font-nunito">Manage subCategory</h2>
      {isLoading ? (
        <EditDataSkeleton />
      ) : (
        <form className="mt-4 border p-8 grid gap-4" onSubmit={handleSubmit}>
          <div
            className={`${role !== "admin" ? "hidden" : "flex"} ${
              slug === "edit" ? "hidden" : "flex"
            } gap-4 mb-2`}
          >
            <label
              htmlFor="id_outlet"
              className="body-text-sm-normal md:body-text-base-normal font-nunitoSans min-w-28 lg:w-52"
            >
              Outlate Name:
            </label>
            <select
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="id_outlet"
              name="id_outlet"
              value={outletName}
              onChange={(e) => setoutletName(e.target.value)}
            >
              <option value="" className="bg-primary50 " disabled>{`${
                slug == "create" ? "Select outlet name" : outletName
              }`}</option>
              {outlet.map((value) => (
                <option key={value.id} value={value.outlet_name}>
                  {value.outlet_name}
                </option>
              ))}
            </select>
          </div>
          <div className={` flex gap-4 mb-2`}>
            <label htmlFor="id_category" className=" min-w-28 lg:w-52">
              Category:
            </label>
            <select
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="id_category"
              name="id_category"
              value={subCategory.id_category}
              onChange={handleChange}
            >
              <option value="" className="bg-primary50 " disabled>{`${
                slug == "create" ? "Select category Name" : subCategory.type
              }`}</option>
              {category.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="title" className="min-w-28 lg:w-52">
              Title:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="title"
              placeholder="title"
              type="text"
              name="title"
              value={subCategory.title}
              onChange={handleChange}
              required
            />
          </div>

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
