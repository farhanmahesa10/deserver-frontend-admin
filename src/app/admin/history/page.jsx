"use client";

import axios from "axios";
import Pagination from "../../component/paginate/paginate";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "nextjs-toploader/app";
import { Toaster, toast } from "react-hot-toast";
import "react-loading-skeleton/dist/skeleton.css";
import { IoFilterOutline, IoCloudDownload } from "react-icons/io5";
import { TableSkeleton } from "../../component/skeleton/adminSkeleton";
import { handleApiError } from "@/app/component/handleError/handleError";
import HanldeRemove from "@/app/component/handleRemove/handleRemove";
import InputSearch from "@/app/component/form/inputSearch";
import Table from "@/app/component/table/table";
import { useSelector } from "react-redux";
import CardOrder from "@/app/component/modal/cardOrder";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import RadioButton from "@/app/component/form/radioButton";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CardRevenue from "@/app/component/card/cardRevenue";
import Select from "@/app/component/form/select";
import { FormatIDR } from "@/app/component/utils/formatIDR";
import { FormatDate } from "@/app/component/utils/formatDate";
import { HighlightText } from "@/app/component/utils/highlightText";

export default function AdminOutlet() {
  const [transaction, setTransaction] = useState([]);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState([]);
  const [outlet, setOutlet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [by_name, setByName] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataToRemove, setDataToRemove] = useState(null);
  const dataOutlet = useSelector((state) => state.counter.outlet);
  const [selectedChecked, setSelectedChecked] = useState("");
  const [cardOrderOpen, setCardOrderOpen] = useState(false);
  const [dataPesanan, setDataPesanan] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // const [startDate, setStartDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [totalRevenue, setTotalRevenue] = useState(false);
  const [totalRevenueSuccess, setTotalRevenueSuccess] = useState(0);
  const [totalRevenueFailed, setTotalRevenueFailed] = useState(0);
  const [countSuccess, setCountSuccess] = useState(0);
  const [countFailed, setCountFailed] = useState(0);
  const [countAll, setCountAll] = useState(0);

  //use state untuk pagination
  const [rows, setRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 5 item per halaman
  const targetRef = useRef(null);

  // Menghitung indeks awal dan akhir untuk menampilkan nomber
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Data yang disimpan dalam state
  //set untuk page yg di tampilkan
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // cek token
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const decoded = jwtDecode(refreshToken);
      const expirationTime = new Date(decoded.exp * 1000);
      const currentTime = new Date();

      if (currentTime > expirationTime) {
        localStorage.clear();
        router.push(`/login`);
      }
    } else {
      router.push(`/login`);
    }
  }, []);

  // useEffect untuk search
  useEffect(() => {
    setSearchQuery(transaction);
  }, [transaction]);

  // function mengambil data transaksi by limit
  const fetchDataPaginated = async (isSearchMode = false) => {
    setIsLoading(true);
    if (isSearchMode) {
      setCurrentPage(1); // Reset ke page 1 jika pencarian
    }
    const token = localStorage.getItem("token");

    const params = {
      page: isSearchMode ? 1 : currentPage,
      limit: itemsPerPage,
      outlet_name:
        dataOutlet.role == "admin pusat" ? query : dataOutlet.outlet_name,
      status: selectedChecked,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
    };

    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/transaction/showpaginatedhistory`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setTransaction(data.data);
      if (data.data?.[0]?.Outlet?.outlet_name) {
        setByName(data.data[0].Outlet.outlet_name);
      }
      setRows(data.pagination.totalItems);
      setIsLoading(false);
      setTotalRevenue(data.totalRevenue);
      setTotalRevenueSuccess(data.totalRevenueSuccess);
      setTotalRevenueFailed(data.totalRevenueFailed);
      setCountAll(data.countFailed + data.countSuccess);
      setCountFailed(data.countFailed);
      setCountSuccess(data.countSuccess);
    } catch (error) {
      await handleApiError(
        error,
        () => fetchDataPaginated(isSearchMode),
        router
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (dataOutlet) {
          await fetchDataPaginated();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (dataOutlet.role) {
      loadData();
    }
  }, [itemsPerPage, currentPage, dataOutlet.role]);

  //handle untuk menghapus data
  const handleRemove = async () => {
    const savedToken = localStorage.getItem("token");

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/delete/${dataToRemove}`,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.status === 200) {
        await fetchDataPaginated();
        setShowConfirmModal(false);
        setIsLoading(false);
      }
    } catch (error) {
      await handleApiError(error, handleRemove, router);
    }
  };

  const confirmRemove = (dataRemove) => {
    setDataToRemove(dataRemove);
    setShowConfirmModal(true);
  };

  //mengambil data outlet
  useEffect(() => {
    setIsLoading(true);
    if (dataOutlet.role == "admin pusat") {
      const fetchData = async () => {
        const token = localStorage.getItem("token");
        try {
          // Mengambil data transaksi menggunakan axios dengan query params
          const response = await axios.get(
            ` ${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data.data;

          setOutlet(data);
        } catch (error) {
          await handleApiError(error, () => fetchData(), router);
        }
      };

      setIsLoading(false);

      fetchData();
    }
  }, []);

  // haldle untuk memperbesar gambar
  const handleModalOrder = (item) => {
    setDataPesanan([item]);
    setCardOrderOpen(true);
  };

  const columns = [
    {
      id: "No",
      header: "No",
      cell: ({ row }) => indexOfFirstItem + row.index + 1,
    },
    {
      header: "Date",
      accessorKey: "updatedAt",
      cell: ({ getValue }) => FormatDate(getValue()),
    },
    {
      header: "Outlet Name",
      accessorKey: "Outlet.outlet_name",
      cell: ({ getValue }) => HighlightText(getValue(), query),
    },
    {
      header: "Customer",
      accessorKey: "by_name",
    },
    {
      header: "No Table",
      accessorKey: "id_table",
    },
    {
      header: "Total",
      accessorKey: "total_pay",
      cell: ({ getValue }) => FormatIDR(getValue()),
    },
    {
      header: "Order",
      id: "orderList",
      cell: ({ row }) => {
        return (
          <div>
            <button
              onClick={() => handleModalOrder(row.original)}
              className="px-4 py-1 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition duration-200"
            >
              detail
            </button>
          </div>
        );
      },
    },
  ];

  const handleChange = (e) => {
    setSelectedChecked(e.target.value);
  };

  const downloadData = async () => {
    const token = localStorage.getItem("token");

    const params = {
      search: dataOutlet.role == "admin" ? dataOutlet.outlet_name : by_name,
      status: selectedChecked,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
    };
    try {
      // Mengambil data transaksi menggunakan axios dengan query params
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/report/download`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      await handleApiError(error, () => downloadData(), router);
    }
  };

  // Mengonversi data ke Excel
  const exportToExcel = async () => {
    const transaksiData = await downloadData();

    if (transaksiData.length === 0) {
      toast.error("No data can be downloaded!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Transaction");

    let currentRow = 1;

    const outletName =
      transaksiData[0]?.Outlet?.outlet_name || "Unknown Outlet";
    const updatedAt = transaksiData[0]?.updatedAt || new Date();

    // Judul Laporan
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = "Financial statements";
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center" };
    worksheet.getCell(`A${currentRow}`).font = { size: 14, bold: true };
    currentRow++;

    // Nama Outlet
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = outletName;
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center" };
    worksheet.getCell(`A${currentRow}`).font = { size: 12, bold: true };
    currentRow++;

    // Baris kosong
    currentRow++;

    // Tanggal
    let tanggalLabel = "-";
    if (startDate && endDate) {
      tanggalLabel = `${FormatDate(startDate)} - ${FormatDate(endDate)}`;
    } else if (startDate) {
      tanggalLabel = `${FormatDate(startDate)}`;
    }

    // Tampilkan tanggal ke worksheet
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `Date : ${tanggalLabel}`;
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "left" };
    currentRow++;

    // Header tabel
    worksheet.getRow(currentRow).values = [
      "No",
      "Title",
      "Amount",
      "Unit Price",
      "Total",
    ];
    worksheet.columns = [
      { key: "no", width: 5 },
      { key: "title", width: 20 },
      { key: "amount", width: 10 },
      { key: "unit_price", width: 15 },
      { key: "total", width: 15 },
    ];
    worksheet.getRow(currentRow).font = { bold: true };
    worksheet.getRow(currentRow).alignment = { horizontal: "center" };

    const startBorderRow = currentRow;
    currentRow++;

    // Data Transaksi
    const itemMap = {};
    transaksiData.forEach((transaksi) => {
      transaksi.Orders.forEach((order) => {
        const title = order.Menu.title;
        const price = order.Menu.price;

        if (itemMap[title]) {
          itemMap[title].amount += 1;
          itemMap[title].total += price;
        } else {
          itemMap[title] = {
            title,
            amount: order.qty,
            unit_price: price,
            total: order.qty * price,
          };
        }
      });
    });

    const rows = Object.values(itemMap);
    let grandTotal = 0;

    rows.forEach((row, index) => {
      worksheet.getRow(currentRow).values = [
        index + 1,
        row.title,
        row.amount,
        row.unit_price,
        row.total,
      ];
      grandTotal += row.total;
      currentRow++;
    });

    // Baris kosong setelah data
    worksheet.getRow(currentRow).values = ["", "", "", "", ""];
    currentRow++;

    // Grand Total
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = "Grand Total";
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center" };
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).value = grandTotal;
    worksheet.getCell(`E${currentRow}`).alignment = { horizontal: "right" };
    worksheet.getCell(`E${currentRow}`).font = { bold: true };

    const endBorderRow = currentRow;

    // Format angka
    worksheet.getColumn("D").numFmt = "#,##0";
    worksheet.getColumn("E").numFmt = "#,##0";

    // Tambahkan border
    for (let row = startBorderRow; row <= endBorderRow; row++) {
      worksheet.getRow(row).eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    // Border tebal untuk Grand Total
    ["A", "B", "C", "D", "E"].forEach((col) => {
      const cell = worksheet.getCell(`${col}${endBorderRow}`);
      cell.border = {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" },
      };
    });

    // === Tambahkan Data Ringkasan (SETELAH TABEL) ===
    currentRow++;

    if (!selectedChecked) {
      currentRow++;

      const summaryData = [
        { label: "Successful Transaction", value: countSuccess },
        { label: "Failed Transaction", value: countFailed },
        {
          label: "Overall transaction",
          value: countSuccess + countFailed,
        },
        { label: "Total Revenue Success", value: totalRevenueSuccess },
        { label: "Total Revenue Failed", value: totalRevenueFailed },
        { label: "Total Revenue", value: totalRevenue },
      ];

      summaryData.forEach((item) => {
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value = item.label;
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "left" };
        worksheet.getCell(`A${currentRow}`).font = { bold: false };

        worksheet.getCell(`E${currentRow}`).value = item.value;
        worksheet.getCell(`E${currentRow}`).alignment = { horizontal: "right" };
        currentRow++;
      });
    }

    // Download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Financial_statements.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToPDF = async () => {
    const transaksiData = await downloadData();

    if (transaksiData.length === 0) {
      toast.error("No data can be downloaded!");
      return;
    }

    const doc = new jsPDF();
    let y = 10;

    const outletName =
      transaksiData[0]?.Outlet?.outlet_name || "Unknown Outlet";
    const updatedAt = transaksiData[0]?.updatedAt || new Date();

    // Format tanggal
    let tanggalLabel = "-";
    if (startDate && endDate) {
      tanggalLabel = `${FormatDate(startDate)} - ${FormatDate(endDate)}`;
    } else if (startDate) {
      tanggalLabel = `${FormatDate(startDate)}`;
    }

    // Judul
    doc.setFontSize(16);
    doc.text("Financial Statements", 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(12);
    doc.text(outletName, 105, y, { align: "center" });
    y += 10;
    doc.text(`Date: ${tanggalLabel}`, 14, y);
    y += 10;

    // Proses data transaksi
    const itemMap = {};
    transaksiData.forEach((transaksi) => {
      transaksi.Orders.forEach((order) => {
        const title = order.Menu.title;
        const price = order.Menu.price;

        if (itemMap[title]) {
          itemMap[title].amount += 1;
          itemMap[title].total += price;
        } else {
          itemMap[title] = {
            title,
            amount: order.qty,
            unit_price: price,
            total: order.qty * price,
          };
        }
      });
    });

    const rows = Object.values(itemMap);
    let grandTotal = 0;

    const tableData = rows.map((row, index) => {
      grandTotal += row.total;
      return [
        index + 1,
        row.title,
        row.amount,
        row.unit_price.toLocaleString(),
        row.total.toLocaleString(),
      ];
    });

    // Tabel utama
    autoTable(doc, {
      startY: y,
      head: [["No", "Title", "Amount", "Unit Price", "Total"]],
      body: tableData,
      styles: { halign: "left" },
    });

    //GRAND TOTAL
    const finalY = doc.lastAutoTable.finalY + 10;
    const totalColX = 160;
    const labelX = totalColX - 30;
    const valueX = totalColX + 13;

    doc.setFontSize(12);
    doc.text("Grand Total:", labelX, finalY);
    doc.text(grandTotal.toLocaleString(), valueX, finalY, { align: "right" });

    // Tambah Data Ringkasan jika tidak selectedChecked
    if (!selectedChecked) {
      const summaryY = finalY + 10;

      const summaryData = [
        { label: "Successful Transaction", value: countSuccess },
        { label: "Failed Transaction", value: countFailed },
        {
          label: "Overall Transaction",
          value: countSuccess + countFailed,
        },
        { label: "Total Revenue Success", value: totalRevenueSuccess },
        { label: "Total Revenue Failed", value: totalRevenueFailed },
        { label: "Total Revenue", value: totalRevenue },
      ];

      summaryData.forEach((item, idx) => {
        const y = summaryY + idx * 7;
        doc.text(`${item.label}:`, 14, y);
        doc.text(`${item.value.toLocaleString()}`, 200, y, { align: "right" });
      });
    }

    // Simpan sebagai PDF
    doc.save("Financial_Statements.pdf");
  };

  return (
    <div
      ref={targetRef}
      className=" pl-5 pt-20 pb-8 w-full bg-white overflow-auto lg:border-l-2"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="overflow-y-auto overflow-x-hidden pr-2 lg:max-h-[calc(100vh-80px)] custom-scrollbar">
        <h1 className="my-2 md:my-5 font-nunitoSans text-darkgray body-text-base-bold text-lg md:text-xl">
          History Data
        </h1>

        <div className="flex items-center justify-between mb-2 ">
          <div className="flex gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 bg-yellow-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition duration-300"
                onClick={exportToExcel}
              >
                <IoCloudDownload size={20} />
                <span>Download as Excel</span>
              </button>
              <button
                className="flex items-center gap-2 bg-yellow-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition duration-300"
                onClick={exportToPDF}
              >
                <IoCloudDownload size={20} />
                <span>Download as PDF</span>
              </button>
            </div>
          </div>

          <>
            {/* Tombol Buka */}

            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-700 text-white rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300"
            >
              <IoFilterOutline className="text-xl" />
              <h2 className="text-lg font-semibold ">Filter</h2>
            </button>

            {/* Overlay */}
            {isOpen && (
              <div
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
              />
            )}

            {/* Off-canvas Panel */}
            <div
              className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 flex flex-col justify-between ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Konten Atas */}
              <div className="p-4 overflow-y-auto flex-grow">
                <div className="flex items-center gap-2  px-4 py-2">
                  <IoFilterOutline className="text-xl" />
                  <h2 className="text-lg font-semibold ">Filter</h2>
                </div>

                <div className="flex flex-wrap ">
                  <div
                    className={`${
                      dataOutlet.role !== "admin pusat" ? "hidden" : "flex"
                    } w-full  gap-4 mb-2`}
                  >
                    <Select
                      label="Outlate Name:"
                      id="id_outlet"
                      name="id_outlet"
                      value={query}
                      options={outlet.map((value) => (
                        <option key={value.id} value={value.outlet_name}>
                          {value.outlet_name}
                        </option>
                      ))}
                      placeholder={"Select outlet name"}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center my-2 ">
                    <h1 className="">Date</h1>
                    <DatePicker
                      className=" py-1 px-1 h-[40px] w-[225px] border border-gray-300 rounded-md shadow-sm focus:outline-yellow-700 text-gray-700 body-text-xs font-poppins"
                      selected={startDate}
                      // onChange={(date) => setStartDate(date)}
                      dateFormat="dd/MM/yyyy"
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                      }}
                      isClearable={true}
                      showYearDropdown
                      scrollableMonthYearDropdown
                      clearButtonClassName="absolute right-2 top-2 text-gray-600 hover:text-gray-900 cursor-pointer" // Custom class for the clear button
                    />
                  </div>

                  <h1 className="my-2">Status</h1>
                  <div className="flex w-full justify-between gap-2 mb-1">
                    <RadioButton
                      name="status"
                      value=""
                      selected={selectedChecked}
                      handleChange={handleChange}
                      item=""
                      description="All"
                    />
                    <RadioButton
                      name="status"
                      value="success"
                      selected={selectedChecked}
                      handleChange={handleChange}
                      item="success"
                      description="Success"
                    />
                    <RadioButton
                      name="status"
                      value="failed"
                      selected={selectedChecked}
                      handleChange={handleChange}
                      item="failed"
                      description="Failed"
                    />
                  </div>
                </div>
              </div>

              {/* Tombol Close di Bawah */}
              <div className="p-4 gap-2 flex justify-between border-t">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    fetchDataPaginated(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        </div>

        <div className="flex gap-2 mb-2 flex-wrap lg:flex-nowrap">
          <CardRevenue value={countSuccess} desc="Count Success" />
          <CardRevenue
            value={countFailed}
            desc="Count Failed"
            classRevenue="bg-red-100 text-red-700"
          />
          <CardRevenue
            value={countAll}
            desc="All"
            classRevenue="bg-primary-50 text-primary-700"
          />
          <CardRevenue
            value={FormatIDR(totalRevenueSuccess)}
            desc="Revenue Success"
          />
          <CardRevenue
            value={FormatIDR(totalRevenueFailed)}
            desc="Revenue Failed"
            classRevenue="bg-red-100 text-red-700"
          />
          <CardRevenue
            value={FormatIDR(totalRevenue)}
            desc="Revenue All"
            classRevenue="bg-primary-50 text-primary-700"
          />
        </div>

        <div className="rounded-lg shadow-lg bg-white overflow-x-auto ">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table data={searchQuery} columns={columns} />
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
        {cardOrderOpen && (
          <CardOrder
            searchQuery={dataPesanan}
            setDataPesanan={setDataPesanan}
            setCardOrderOpen={setCardOrderOpen}
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
