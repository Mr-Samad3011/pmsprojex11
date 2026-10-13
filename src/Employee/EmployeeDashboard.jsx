import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

import DashboardHeader from "../components/DashboardHeader";
import ProjectTable from "../Employee/ProjectTable";

export default function EmployeeDashboard() {

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const socketRef = useRef(null);

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  /* ================= AXIOS INSTANCE ================= */

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* ================= FETCH PROJECTS ================= */

  const fetchAssignedProjects = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axiosInstance.get("/api/employee/projects");

      setAssignedProjects(res.data || []);

    } catch (err) {

      console.error("Project fetch error:", err);
      toast.error("Failed to load projects");

    } finally {

      setLoading(false);

    }

  }, []);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {

    fetchAssignedProjects();

  }, [fetchAssignedProjects]);

  /* ================= SOCKET CONNECTION ================= */

  useEffect(() => {

    if (socketRef.current) return;

    socketRef.current = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("employeeLaunched", (data) => {

      toast.success(data.message);

      // refresh table after launch
      fetchAssignedProjects();

    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {

      if (socketRef.current) {

        socketRef.current.disconnect();
        socketRef.current = null;

      }

    };

  }, [fetchAssignedProjects]);

  /* ================= RENDER ================= */

  return (

    <div className="min-h-screen bg-gray-100">

      <Toaster position="top-right" reverseOrder={false} />

      <DashboardHeader />

      {/* ---------------- Filters ---------------- */}

      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-4 bg-white shadow-sm rounded-md">

        {/* Status Filter */}
        <div className="flex items-center gap-2">

          <h2 className="text-sm font-semibold">Project Status:</h2>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value="All">All</option>
            <option value="Live">Live</option>
            <option value="Paused">Paused</option>
            <option value="Complete">Complete</option>
          </select>

        </div>

        {/* Rows Per Page */}

        <div className="flex items-center gap-2">

          <span className="text-sm font-medium">Show</span>

          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <span className="text-sm font-medium">entries</span>

        </div>

        {/* Search */}

        <input
          type="text"
          placeholder="Search survey ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-1 rounded text-sm w-60"
        />

      </div>

      {/* ---------------- TABLE ---------------- */}

      {loading ? (

        <div className="text-center mt-10 text-gray-500">
          Loading projects...
        </div>

      ) : (

        <ProjectTable
          projects={assignedProjects}
          selectedStatus={selectedStatus}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
        />

      )}

    </div>

  );

}