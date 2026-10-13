/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { FaEdit, FaPlay, FaPause, FaTimesCircle } from "react-icons/fa";

export default function Dashboard({ onSelectProject }) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20); // show 20 projects per page
  const [summary, setSummary] = useState({
    live: 0,
    paused: 0,
    closed: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);

      // Summary counts
      const live = res.data.filter(p => p.status === "Live").length;
      const paused = res.data.filter(p => p.status === "Paused").length;
      const closed = res.data.filter(p => p.status === "Complete").length;

      setSummary({ live, paused, closed });
    } catch (err) {
      console.error(err);
    }
  };


const handleStatusChange = async (projectId, newStatus) => {
  try {
    // Step 1: Fetch CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      { withCredentials: true }
    );

    const csrfToken = csrfResponse.data.csrfToken;

    // Step 2: Update project status
    await axios.patch(
      `${BASE_URL}/api/admin/projects/${projectId}/status`,
      { status: newStatus },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    // Step 3: Update UI after successful response
    const updatedProjects = projects.map((p) =>
      p._id === projectId ? { ...p, status: newStatus } : p
    );

    setProjects(updatedProjects);

    setSummary({
      live: updatedProjects.filter((p) => p.status === "Live").length,
      paused: updatedProjects.filter((p) => p.status === "Paused").length,
      closed: updatedProjects.filter((p) => p.status === "Complete").length,
    });
  } catch (err) {
    console.error("Status update failed:", err.response?.status);
    console.error("Server response:", err.response?.data);
    console.error("Request URL:", err.config?.url);
  }
};






  // Pagination logic
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentProjects = projects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(projects.length / perPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

const getInvoiceMonth = (p) => {
  if (!p?.createdAt) return "Not Available";

  const date = new Date(p.createdAt);

  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};






  return (
    <div className="p-4">
      {/* Top summary row */}
      {/* Top summary row */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  {/* Live */}
  <div className="bg-green-100 p-4 rounded shadow flex items-center justify-between">
    <div>
      <h3 className="text-sm font-medium">Live Projects</h3>
      <p className="text-2xl font-bold">{summary.live}</p>
    </div>
    <FaPlay className="text-green-600 text-2xl" />
  </div>

  {/* Paused */}
  <div className="bg-yellow-100 p-4 rounded shadow flex items-center justify-between">
    <div>
      <h3 className="text-sm font-medium">Paused Projects</h3>
      <p className="text-2xl font-bold">{summary.paused}</p>
    </div>
    <FaPause className="text-yellow-600 text-2xl" />
  </div>

  
  {/* Closed */}
<div className="bg-red-100 p-4 rounded shadow flex items-center justify-between">
  <div>
    <h3 className="text-sm font-medium">Closed Projects</h3>
    <p className="text-2xl font-bold">{summary.closed}</p>
  </div>
  <FaTimesCircle className="text-red-600 text-2xl" />
</div>


</div>


      {/* Projects Table */}
     <div className="overflow-x-auto max-h-[750px] border rounded shadow-lg">

       <table className="min-w-full border border-gray-200 table-fixed text-base">

        <thead className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
  <tr>
    <th className="px-6 py-4 border-b">Sr. No.</th>
    <th className="px-6 py-4 border-b"># </th>
    <th className="px-6 py-4 border-b">Project Name</th>
    <th className="px-6 py-4 border-b">Customer Name</th>
    <th className="px-6 py-4 border-b">Project Progress</th>
    <th className="px-6 py-4 border-b">Status</th>
    <th className="px-6 py-4 border-b">Edit</th>
  </tr>
</thead>

      <tbody>
  {currentProjects.map((p, index) => (
    <tr key={p._id} className="hover:bg-gray-50 transition text-base">

      {/* Sr. No */}
      <td className="px-6 py-5 border-b font-medium">
        {indexOfFirst + index + 1}
      </td>

      {/* Project ID + Invoice Month */}
      <td className="px-6 py-5 border-b">
        <div className="font-semibold text-gray-800">
          {p.surveyId}
        </div>
       
      </td>

      {/* Project Name */}
  <td className="px-6 py-6 border-b">
  {/* Clickable Project Name */}
  <div
    onClick={() => onSelectProject(p)}
    className="text-blue-700 font-semibold text-lg cursor-pointer hover:underline"
  >
    {p.projectName}
  </div>

  {/* Invoice Month */}
  <div className="text-sm text-gray-500 mt-2">
    <span className="font-medium text-gray-600">
      Invoice Month:
    </span>{" "}
    {getInvoiceMonth(p)}
  </div>
</td>




      {/* Customer */}
      <td className="px-6 py-5 border-b font-medium">
        {p.customerName}
      </td>

      {/* Progress */}
      <td className="px-6 py-5 border-b w-56">
        <div className="w-full bg-gray-200 h-4 rounded">
          <div
            className={`h-4 rounded ${
              p.status === "Live"
                ? "bg-green-500"
                : p.status === "Paused"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${p.progress || 0}%` }}
          />
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-6 py-5 border-b">
        <span
          className={`px-4 py-1 rounded-full text-white text-sm font-semibold
            ${
              p.status === "Live"
                ? "bg-green-600"
                : p.status === "Paused"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
        >
          {p.status}
        </span>
      </td>

      {/* Edit + Status Change */}
      <td className="px-6 py-5 border-b w-44">
        <div className="flex items-center gap-3">

          <button
            onClick={() => onSelectProject(p)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            <FaEdit size={15} />
          </button>

          <select
            value={p.status}
            onChange={(e) =>
              handleStatusChange(p._id, e.target.value)
            }
            className={`px-3 py-2 rounded text-white text-sm font-medium cursor-pointer
              ${
                p.status === "Live"
                  ? "bg-green-600"
                  : p.status === "Paused"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
          >
            <option value="Live">Live</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Complete</option>
          </select>

        </div>
      </td>

    </tr>
  ))}
</tbody>


        </table>
      </div>

      {/* Pagination - Prev / Next only */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
