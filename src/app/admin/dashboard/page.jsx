"use client";

import FilterDrawer from "@/app/component/filterDrawer/page.jsx";
import { getNewAccessToken } from "@/app/component/token/refreshToken";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
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
    const checkToken = () => {
      const accessToken = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        router.push("/login");
        return;
      }

      const decoded = jwtDecode(refreshToken);
      const expirationTime = new Date(decoded.exp * 1000);
      const currentTime = new Date();

      if (currentTime > expirationTime) {
        localStorage.clear();
        router.push("/login");
      } else {
        setToken(accessToken);
      }
    };

    checkToken();
  }, [router]);

  const fetchChartDataWithToken = async (accessToken, query = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(query).toString();

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/grafik/sales?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

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
      await handleError(error, query);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (query = {}) => {
    if (token) {
      await fetchChartDataWithToken(token, query);
    }
  };

  const handleError = async (error, query = {}) => {
    if (error.response?.status === 401) {
      try {
        const newToken = await getNewAccessToken();
        localStorage.setItem("token", newToken);
        setToken(newToken);

        await fetchChartDataWithToken(newToken, query);
      } catch (err) {
        console.error("Failed to refresh token:", err);
        toast.error("Session Anda telah berakhir. Silakan login ulang.");
        localStorage.clear();
        router.push("/login");
      }
    } else {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  useEffect(() => {
    if (token) {
      fetchChartData();
    }
  }, [token]);

  const handleApplyFilter = () => {
    const [startDate, endDate] = dateRange;
    const query = {};

    if (!startDate && !endDate) {
      toast.success("Showing data for the last 30 days");
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error("Select start date and end date.");
      return;
    } else {
      query.startDate = startDate.toISOString().split("T")[0];
      query.endDate = endDate.toISOString().split("T")[0];
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
