/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaMoneyBillWave,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";

export default function AdminDashboardData() {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    live: 0,
    paused: 0,
    closed: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/dashboard-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
 console.log("Dashboard API Response:", res.data); // 👈 ADD THIS

      setEmployees(res.data.employees);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination Logic
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = employees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(employees.length / perPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="p-6">

      {/* ================= 1ST ROW - SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">

        <div className="bg-green-100 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p className="text-sm">Live Projects</p>
            <h2 className="text-2xl font-bold">{summary.live}</h2>
          </div>
          <FaPlay className="text-green-600 text-2xl" />
        </div>

        <div className="bg-yellow-100 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p className="text-sm">Paused Projects</p>
            <h2 className="text-2xl font-bold">{summary.paused}</h2>
          </div>
          <FaPause className="text-yellow-600 text-2xl" />
        </div>

        <div className="bg-red-100 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p className="text-sm">Closed Projects</p>
            <h2 className="text-2xl font-bold">{summary.closed}</h2>
          </div>
          <FaTimesCircle className="text-red-600 text-2xl" />
        </div>

        <div className="bg-blue-100 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p className="text-sm">Total Revenue</p>
            <h2 className="text-2xl font-bold">${summary.totalRevenue}</h2>
          </div>
          <FaMoneyBillWave className="text-blue-600 text-2xl" />
        </div>

        <div className="bg-purple-100 p-4 rounded shadow flex items-center justify-between">
          <div>
            <p className="text-sm">Pending Revenue</p>
            <h2 className="text-2xl font-bold">${summary.pendingRevenue}</h2>
          </div>
          <FaClock className="text-purple-600 text-2xl" />
        </div>

      </div>

      {/* ================= 2ND ROW - HEADING ================= */}
      <h2 className="text-xl font-semibold mb-4">
        Work Load Tracking
      </h2>

      {/* ================= 3RD ROW - TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Full Name</th>
              <th className="px-4 py-2 border-b text-left">Department</th>
              <th className="px-4 py-2 border-b text-left">Position</th>
              <th className="px-4 py-2 border-b text-left">No of Live Jobs</th>
              <th className="px-4 py-2 border-b text-left">No of Paused Jobs</th>
              <th className="px-4 py-2 border-b text-left">Total Revenue</th>
              <th className="px-4 py-2 border-b text-left">Total Pending Revenue</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="px-4 py-2 border-b">{emp.department}</td>
                <td className="px-4 py-2 border-b">{emp.position}</td>
                <td className="px-4 py-2 border-b">{emp.liveJobs}</td>
                <td className="px-4 py-2 border-b">{emp.pausedJobs}</td>
                <td className="px-4 py-2 border-b">₹{emp.totalRevenue}</td>
                <td className="px-4 py-2 border-b">₹{emp.pendingRevenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= 4TH ROW - PAGINATION ================= */}
      <div className="flex justify-end items-center gap-3 mt-6">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>

    </div>
  );
}
