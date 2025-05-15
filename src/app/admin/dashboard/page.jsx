"use client";

import FilterDrawer from "@/app/component/filterDrawer/page.jsx";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { io } from "socket.io-client";
import instance from "@/app/component/api/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    success: 0,
    failed: 0,
  });

  const [filterSuccess, setFilterSuccess] = useState(false);
  const [filterFailed, setFilterFailed] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socket.on("AdminReceiveCanceled", (response) => {
      alert("canceled");
      if ((response.status = "success")) {
        console.log("cancel");
      }
    });

    return () => {
      socket.off("AdminReceiveCanceled");
      socket.disconnect();
    };
  }, []);

  const fetchChartDataWithToken = async (query = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(query).toString();
      console.log(params, "params");

      const res = await instance.get(`/api/v1/grafik/sales?${params}`);

      const chartData = res.data.data;

      let allSeries = chartData.series;

      if (query.status === "success") {
        allSeries = allSeries.filter((s) => s.name.toLowerCase().includes("success"));
      } else if (query.status === "failed") {
        allSeries = allSeries.filter((s) => s.name.toLowerCase().includes("failed"));
      }

      setSeries(allSeries);

      const colorMap = {
        success: "#22C55E",
        "success revenue": "#16A34A",
        failed: "#EF4444",
        "failed revenue": "#B91C1C",
      };

      const colors = allSeries.map((s) => colorMap[s.name.trim().toLowerCase()] || "#888");

      setOptions({
        chart: { id: "sales-chart" },
        xaxis: { categories: chartData.categories },
        colors,
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            shadeIntensity: 0.5,
            opacityFrom: 0.7,
            opacityTo: 0.2,
            stops: [0, 90, 100],
          },
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        markers: {
          size: 4,
          colors,
          strokeColors: "#fff",
          strokeWidth: 2,
        },
        legend: { show: true },
        tooltip: { theme: "light" },
      });

      setRevenueData({
        total: chartData.totalRevenue,
        success: chartData.totalRevenueSuccess,
        failed: chartData.totalRevenueFailed,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async (query = {}) => {
    await fetchChartDataWithToken(query);
  };

  const handleApplyFilter = () => {
    const [startDate, endDate] = dateRange;
    const toLocalDate = (date) => date.toLocaleDateString("sv-SE");

    const query = {};

    if (!startDate && !endDate) {
      toast.success("Showing data for the last 30 days");
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error("Select start date and end date.");
      return;
    } else {
      query.startDate = toLocalDate(startDate);
      query.endDate = toLocalDate(endDate);
    }

    if (filterSuccess) query.status = "success";
    else if (filterFailed) query.status = "failed";

    setModal(false);
    fetchChartData(query);
  };

  const successOrders = series.find((s) => s.name.trim().toLowerCase() === "success")?.data.reduce((sum, value) => sum + value, 0) || 0;
  const failedOrders = series.find((s) => s.name.trim().toLowerCase() === "failed")?.data.reduce((sum, value) => sum + value, 0) || 0;

  return (
    <div className="p-6 space-y-6 mt-[100px] w-full">
      <div className="flex justify-end gap-4">
        <Toaster position="top-center" reverseOrder={false} />
        <button onClick={() => setModal(true)} className="bg-blue-500 flex gap-2 text-white px-4 py-2 rounded hover:bg-blue-600">
          <FaFilter className="align-middle" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-100 text-green-800 p-4 rounded shadow text-center">
          <div className="text-xl font-bold">{loading ? "Loading..." : successOrders}</div>
          <div>Success Orders</div>
        </div>
        <div className="bg-blue-100 text-blue-800 p-4 rounded shadow text-center">
          <div className="text-xl font-bold">Rp {revenueData.success.toLocaleString("id-ID")}</div>
          <div>Success Revenue</div>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded shadow text-center">
          <div className="text-xl font-bold">{loading ? "Loading..." : failedOrders}</div>
          <div>Failed Orders</div>
        </div>
        <div className="bg-blue-100 text-blue-800 p-4 rounded shadow text-center">
          <div className="text-xl font-bold">Rp {revenueData.failed.toLocaleString("id-ID")}</div>
          <div>Failed Revenue</div>
        </div>
      </div>

      <FilterDrawer
        isOpen={modal}
        onClose={() => setModal(false)}
        onApply={handleApplyFilter}
        filterSuccess={filterSuccess}
        filterFailed={filterFailed}
        setFilterSuccess={setFilterSuccess}
        setFilterFailed={setFilterFailed}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <div className="bg-white p-6 rounded shadow">{series.length > 0 && options.xaxis ? <Chart options={options} series={series} type="area" height={350} /> : <div className="text-center text-gray-500">Data there is not</div>}</div>
    </div>
  );
}
