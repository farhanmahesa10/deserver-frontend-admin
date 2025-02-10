"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import EditDataSkeleton from "../../adminSkeleton/editDataSkeleton";
import { getNewAccessToken } from "../../refreshToken";

export default function AddContact({ params }) {
  const [contact, setContact] = useState({
    id_outlet: "",
    contact_name: "",
    value: "",
    link: "",
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
              setContact((contact) => ({
                ...contact,
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

  //mengambildata contact ketika edit
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug === "edit") {
          const idContact = localStorage.getItem("id_contact");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/contact/show/${idContact}`
          );

          const data = response.data;
          setContact(data);

          setSelectedFile(data.logo);
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
    console.log(contact);

    if (!contact.contact_name || !contact.value || !contact.link) {
      alert("Harap isi semua field!");
      return;
    }

    const formData = new FormData();
    formData.append("id_outlet", contact.id_outlet);
    formData.append("contact_name", contact.contact_name);
    formData.append("value", contact.value);
    formData.append("link", contact.link);

    if (selectedFile) {
      formData.append("logo", selectedFile);
    } else if (contact.logo) {
      formData.append("logo", contact.logo);
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
        console.error("Error deleting contact:", error);
      }
    };

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (contact.id) {
        setLoadingButton(true);
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/contact/update/${contact.id}`,
          formData,
          { headers }
        );
        localStorage.removeItem("id_contact");
        alert("Data berhasil diperbarui!");
      } else {
        setLoadingButton(true);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/contact/create`,
          formData,
          { headers }
        );
        alert("Data berhasil ditambahkan!");
      }

      router.push("/admin/contact");
      setLoadingButton(false);
    } catch (error) {
      await handleError(error);
    }
  };

  const handleCancel = () => {
    router.push("/admin/contact");
    localStorage.removeItem("id_contact");
  };

  // Handler untuk perubahan nilai input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact((contact) => ({
      ...contact,
      [name]: value,
    }));
  };

  // Handle pilihan gambar dari folder lokal
  const handleSelectImage = async (imageName) => {
    const response = await fetch(`/img/${imageName}`);
    const blob = await response.blob();

    // Buat objek File secara manual
    const file = new File([blob], imageName, { type: blob.type });
    setSelectedFile(file); // Simpan ke selectedFile dengan format File
  };

  return (
    <div className="p-8 pt-20 w-full">
      <h2 className="text-xl font-nunito">Manage Contact</h2>
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
              value={contact.id_outlet}
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
            <label htmlFor="contact_name" className="min-w-28 lg:w-52">
              Contact_name:
            </label>

            <select
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="contact_name"
              name="contact_name"
              value={contact.contact_name}
              onChange={handleChange}
              required
            >
              <option
                value=""
                disabled
                className="bg-primary50 font-semibold text-black"
              >{`${
                slug == "create" ? "Select Contact Name" : contact.contact_name
              }`}</option>
              <option value="instagram">instagram</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="Facebook">Facebook</option>
              <option value="Twiter">Twiter</option>
              <option value="Tik Tok">Tik Tok</option>
            </select>
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="value" className="min-w-28 lg:w-52">
              value:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="value"
              placeholder="Value"
              type="text"
              name="value"
              value={contact.value}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex gap-4 mb-2">
            <label htmlFor="link" className="min-w-28 lg:w-52">
              link:
            </label>
            <input
              className="border p-1 rounded-lg border-primary50 w-full h-8"
              id="link"
              placeholder="link"
              type="text"
              name="link"
              value={contact.link ? contact.link : ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex gap-4 mb-2 ">
            <label htmlFor="photo" className="min-w-28 lg:w-40 ">
              Pilih Logo:
            </label>
            <div className="flex gap-2 flex-wrap ">
              {["instagram.png", "contact.png", "facebook.png"].map((image) => (
                <button
                  key={image}
                  type="button"
                  className="border p-2 rounded-lg"
                  onClick={() => handleSelectImage(image)}
                >
                  <img
                    src={`/img/${image}`}
                    alt={image}
                    className="w-10 h-10 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {(selectedFile || contact.logo) && (
            <div className="flex gap-4 mb-2">
              <label className="min-w-28 lg:w-52">Preview:</label>
              <img
                src={
                  slug === "create"
                    ? URL.createObjectURL(selectedFile)
                    : contact.logo !== selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : `${process.env.NEXT_PUBLIC_BASE_API_URL}/${contact.logo}`
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
