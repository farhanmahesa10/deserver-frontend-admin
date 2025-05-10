"use client";

import Pagination from "../../component/paginate/paginate";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";
import Modal from "../../component/modal/cardImage";
import { AiFillEdit } from "react-icons/ai";
import { IoSearch, IoTrash, IoMedkit } from "react-icons/io5";
import { TableSkeleton } from "@/app/component/skeleton/adminSkeleton";
import { Toaster, toast } from "react-hot-toast";
import HanldeRemove from "@/app/component/handleRemove/handleRemove";
import InputSearch from "@/app/component/form/inputSearch";
import Table from "@/app/component/table/table";
import { Collapse } from "react-collapse";
import { useSelector } from "react-redux";
import { HighlightText } from "@/app/component/utils/highlightText";
import instance from "@/app/component/api/api";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [queryMenu, setQueryMenu] = useState("");
  const [searchQuery, setSearchQuery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataToRemove, setDataToRemove] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const dataOutlet = useSelector((state) => state.counter.outlet);

  //use state untuk pagination
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // 5 item per halaman
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

  //setiap kali ada perubahan di current page maka scroll ke atas
  useEffect(() => {
    targetRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(menu);
  }, [menu]);

  const fetchDataPaginated = async (isSearchMode = false) => {
    setIsLoading(true);
    if (isSearchMode) {
      setCurrentPage(1); // Reset ke page 1 jika pencarian
    }

    const params = {
      page: isSearchMode ? 1 : currentPage,
      limit: itemsPerPage,
      search: dataOutlet.role == "admin" ? dataOutlet.outlet_name : query,
      search_title: queryMenu,
    };
    try {
      // Mengambil data transaksi menggunakan instance dengan query params
      const response = await instance.get(`/api/v1/menu/showpaginated`, {
        params: params,
      });

      const data = response.data.data;
      setMenu(data);
      setRows(response.data.pagination.totalItems);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect mengambil data lapangan by limit
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Tampilkan loading
      try {
        if (dataOutlet.role) {
          await fetchDataPaginated();
        }
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
        `/api/v1/menu/delete/${dataToRemove}`
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

  const handleUpdate = async (dataUdate, boolean) => {
    const best = {
      best_seller: boolean,
    };

    try {
      setIsLoading(true);
      const response = await instance.put(
        `/api/v1/menu/update/${dataUdate}`,
        best
      );

      if (response.status === 200) {
        if (dataOutlet.role) {
          await fetchDataPaginated();
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleUpdateStok = async (idUpdate, stok) => {
    const data = {
      status: stok,
    };

    try {
      setIsLoading(true);
      const response = await instance.put(
        `/api/v1/menu/update/${idUpdate}`,
        data
      );

      if (response.status === 200) {
        if (dataOutlet.role) {
          await fetchDataPaginated();
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // haldle untuk memperbesar gambar
  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl); // Menyimpan URL gambar yang diklik
    setIsModalOpen(true); // Membuka modal
  };

  //open details
  const handleToggle = (id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const columns = [
    {
      id: "No",
      header: "No",
      cell: ({ row }) => indexOfFirstItem + row.index + 1,
    },
    {
      header: "Outlet Name",
      accessorFn: (row) => row.SubCategory.Category.Outlet.outlet_name,
      cell: ({ getValue }) => HighlightText(getValue(), query),
    },
    {
      header: "Sub Category Name",
      accessorFn: (row) => row.SubCategory.title,
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: ({ getValue }) => HighlightText(getValue(), queryMenu),
    },
    {
      header: "Price",
      accessorKey: "price",
    },
    {
      header: "Detail",
      accessor: "details",
      cell: ({ row }) => {
        const isOpen = openRows[row.id] || false;

        return (
          <div>
            <Collapse isOpened={isOpen}>
              <p>{row.original.details}</p>
            </Collapse>
            {!isOpen && <p className="line-clamp-2">{row.original.details}</p>}

            {row.original.details.length > 30 && (
              <button
                className={isOpen ? "text-red-500" : "text-primary-500"}
                onClick={() => handleToggle(row.id)}
              >
                {isOpen ? "closed" : "see more"}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: "Photo",
      id: "photo",
      cell: ({ row }) => {
        const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}/${row.original.photo}`;
        return (
          <img
            src={row.original.photo ? imageUrl : "-"}
            alt="Menu Photo"
            className="w-12 h-12 rounded-md shadow-md cursor-pointer mx-auto"
            onClick={() => handleImageClick(imageUrl)}
          />
        );
      },
    },
    {
      header: "Stok",
      id: "stok",
      cell: ({ row }) => {
        const { id, status } = row.original;
        return (
          <button
            className="bg-yellow-700 text-white rounded-lg p-2"
            onClick={() =>
              handleUpdateStok(id, status === "Ready" ? "SoldOut" : "Ready")
            }
          >
            {status}
          </button>
        );
      },
    },
    {
      header: "Best Seller",
      id: "bestSeller",
      cell: ({ row }) => {
        const { id, best_seller } = row.original;
        return (
          <button
            className="bg-yellow-700 text-white rounded-lg p-2"
            onClick={() =>
              handleUpdate(id, best_seller === true ? "false" : "true")
            }
          >
            {best_seller ? "true" : "false"}
          </button>
        );
      },
    },
    {
      header: "Action",
      id: "action",
      cell: ({ row }) => {
        const { id, SubCategory } = row.original;
        return (
          <div className="flex justify-center gap-2">
            <a
              href={`/admin/menu/edit?id=${id}`}
              onClick={() => {
                localStorage.setItem("id_menu", id);
                localStorage.setItem(
                  "outlet_name",
                  SubCategory.Category.Outlet.outlet_name
                );
              }}
              className="text-sm text-white p-1 rounded-sm bg-blue-500"
            >
              <AiFillEdit />
            </a>
            <button
              className="text-sm text-white p-1 rounded-sm bg-red-500"
              onClick={() => confirmRemove(id)}
            >
              <IoTrash />
            </button>
          </div>
        );
      },
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
          Menu Data Settings
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
            linkCreate={"/admin/menu/create"}
            isLoading={isLoading}
            inputLeft={true}
            typeLeft={"text"}
            placeholderLeft={"Menu Name. . ."}
            idLeft={"search_menu"}
            valueLeft={queryMenu}
            onchangeLeft={(e) => setQueryMenu(e.target.value)}
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
        {searchQuery.length > 0 && (
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
