"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";
import Pagination from "../../component/paginate/paginate";
import Modal from "../../component/modal/cardImage";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { Toaster, toast } from "react-hot-toast";
import HanldeRemove from "@/app/component/handleRemove/handleRemove";
import InputSearch from "@/app/component/form/inputSearch";
import Table from "@/app/component/table/table";
import { useSelector } from "react-redux";
import { HighlightText } from "@/app/component/utils/highlightText";
import instance from "@/app/component/api/api";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataToRemove, setDataToRemove] = useState(null);
  const dataOutlet = useSelector((state) => state.counter.outlet);

  //use state untuk pagination
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 item per halaman
  const targetRef = useRef(null);

  // Menghitung indeks awal dan akhir untuk menampilkan nomber
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Data yang disimpan dalam state
  //set untuk page yg di tampilkan
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //toast data baru
  useEffect(() => {
    const newData = localStorage.getItem("newData");
    if (newData) {
      toast.success(newData);
      localStorage.removeItem("newData");
    }
  }, []);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(gallery);
  }, [gallery]);

  const fetchDataPaginated = async (isSearchMode = false) => {
    setIsLoading(true);
    if (isSearchMode) {
      setCurrentPage(1); // Reset ke page 1 jika pencarian
    }

    const params = {
      page: isSearchMode ? 1 : currentPage,
      limit: itemsPerPage,
      search: query,
    };
    try {
      // Mengambil data transaksi menggunakan instance dengan query params
      const response = await instance.get(`/api/v1/gallery/showpaginated`, {
        params: params,
      });

      const data = response.data.data;
      setGallery(data);
      setRows(response.data.pagination.totalItems);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  //useEffect mengambil data gallery
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Tampilkan loading
      try {
        await fetchDataPaginated();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Pastikan loading dihentikan
      }
    };

    if (dataOutlet.role) {
      loadData();
    }
  }, [itemsPerPage, currentPage, dataOutlet.role]);

  //handle untuk menghapus data
  const handleRemove = async () => {
    try {
      setIsLoading(true);
      const response = await instance.delete(
        `/api/v1/gallery/delete/${dataToRemove}`
      );

      if (response.status === 200) {
        await fetchDataPaginated();
        setShowConfirmModal(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirmRemove = (dataRemove) => {
    setDataToRemove(dataRemove);
    setShowConfirmModal(true);
  };

  // haldle untuk memperbesar gambar
  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl); // Menyimpan URL gambar yang diklik
    setIsModalOpen(true); // Membuka modal
  };

  const columns = [
    {
      id: "No",
      header: "No",
      cell: ({ row }) =>
        dataOutlet.role !== "admin pusat"
          ? row.index + 1
          : indexOfFirstItem + row.index + 1,
    },
    {
      header: "Outlet Name",
      accessorKey: "Outlet.outlet_name",
      cell: ({ getValue }) => HighlightText(getValue(), query),
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Photo",
      id: "Photo",
      cell: ({ row }) => {
        const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${row.original.image}`;
        return (
          <img
            src={row.original.image ? imageUrl : "-"}
            alt="Gallery Photo"
            className="w-12 h-12 rounded-md shadow-md cursor-pointer mx-auto"
            onClick={() => handleImageClick(imageUrl)}
          />
        );
      },
    },
    {
      header: "Action",
      id: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <a
            href={`/admin/gallery/edit?id=${row.original.id}`}
            onClick={() => localStorage.setItem("id_gallery", row.original.id)}
            className="text-sm text-white p-1 rounded-sm bg-blue-500"
          >
            <AiFillEdit />
          </a>
          <button
            className="text-sm text-white p-1 rounded-sm bg-red-500"
            onClick={() => confirmRemove(row.original.id)}
          >
            <IoTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      ref={targetRef}
      className=" pl-5 pt-20 pb-8 w-full bg-white overflow-auto lg:border-l-2"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="overflow-y-auto overflow-x-hidden pr-2 lg:max-h-[calc(100vh-80px)] custom-scrollbar">
        <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold text-lg md:text-xl">
          Gallery Data Settings
        </h1>

        <div>
          <InputSearch
            role={dataOutlet.role}
            type="text"
            placeholder="Outlet Name. . ."
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onRightButtonCLick={() => fetchDataPaginated(true)}
            rightButton={<IoSearch />}
            createData={<IoMedkit />}
            linkCreate={"/admin/gallery/create"}
            isLoading={isLoading}
          />
        </div>

        <div className="rounded-lg shadow-lg bg-white overflow-x-auto ">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table data={searchQuery} columns={columns} />
          )}
          {/* Modal */}
          {isModalOpen && (
            <Modal
              currentImage={currentImage}
              setIsModalOpen={setIsModalOpen}
              setCurrentImage={setCurrentImage}
            />
          )}
        </div>

        {/* Tampilkan navigasi pagination */}
        {searchQuery && searchQuery.length > 0 && (
          <Pagination
            itemsPerPage={itemsPerPage}
            rows={rows}
            paginate={paginate}
            currentPage={currentPage}
            isLoading={isLoading}
          />
        )}

        {/* modal konfirmasi delete */}
        {showConfirmModal && (
          <HanldeRemove
            handleRemove={handleRemove}
            setShowConfirmModal={() => setShowConfirmModal(false)}
          />
        )}
      </div>
    </div>
  );
}
