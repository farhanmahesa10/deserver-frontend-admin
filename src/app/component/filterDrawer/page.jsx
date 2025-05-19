"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FilterDrawer({ isOpen, onClose, onApply, filterSuccess, filterFailed, setFilterSuccess, setFilterFailed, dateRange, setDateRange }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-full md:w-96 h-full bg-white shadow-lg z-50 p-6 overflow-auto transition-transform">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Filter</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">
          &times;
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Status</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="all"
              checked={!filterSuccess && !filterFailed}
              onChange={() => {
                setFilterSuccess(false);
                setFilterFailed(false);
              }}
            />
            All
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="success"
              checked={filterSuccess}
              onChange={() => {
                setFilterSuccess(true);
                setFilterFailed(false);
              }}
            />
            Success
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="failed"
              checked={filterFailed}
              onChange={() => {
                setFilterSuccess(false);
                setFilterFailed(true);
              }}
            />
            Failed
          </label>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Date Range</label>
        <DatePicker
          selectsRange
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onChange={(update) => {
            setDateRange(update);
          }}
          dateFormat="yyyy-MM-dd"
          className="w-full border p-2 rounded"
          placeholderText="Select date range"
          isClearable
        />
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Cancel
        </button>
        <button
          onClick={() => {
            onApply();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
