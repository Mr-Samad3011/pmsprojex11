
/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import GroupTargetModal from "./GroupTargetModal";
import EditProjectModal from "./EditProjectModal";

export default function ProjectListPage({ setActivePage, setSelectedProjectId }) {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [programmers, setProgrammers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [editProject, setEditProject] = useState(null);
  const [groupModalProjectId, setGroupModalProjectId] = useState(null);
  
  
const statusOptions = [
  { value: "Live", label: "Live" },
  { value: "Paused", label: "Paused" },
  { value: "Stop", label: "Stop" },
];
  const [filters, setFilters] = useState({
    customer: null,
    project: null,
    status: null,
    programmer: null,
  });

 

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get( `${BASE_URL}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(data);
      setFilteredProjects(data);

      const uniqueCustomers = Array.from(new Set(data.map(p => p.customerName))).map(c => ({
        value: c,
        label: c,
      }));
      setCustomers(uniqueCustomers);

      const uniqueProgrammers = Array.from(new Set(data.flatMap(p => p.projectManager || []))).map(
        p => ({ value: p, label: p })
      );
      setProgrammers(uniqueProgrammers);
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  };

  // Filters
  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));

  const handleSearch = () => {
    let temp = [...projects];
    if (filters.customer) temp = temp.filter(p => p.customerName === filters.customer.value);
    if (filters.project) temp = temp.filter(p => p.projectName === filters.project.value);
    if (filters.status) temp = temp.filter(p => p.status === filters.status.value);
    if (filters.programmer)
      temp = temp.filter(p => p.projectManager?.includes(filters.programmer.value));
    setFilteredProjects(temp);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ customer: null, project: null, status: null, programmer: null });
    setFilteredProjects(projects);
    setCurrentPage(1);
  };


 
  const handleStatusChange = async (projectId, newStatus) => {
  try {
    await axios.patch(
      `${BASE_URL}/api/admin/projects/${projectId}/status`,
      { status: newStatus },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // local update
    setProjects(prev =>
      prev.map(p =>
        p._id === projectId ? { ...p, status: newStatus } : p
      )
    );

    setFilteredProjects(prev =>
      prev.map(p =>
        p._id === projectId ? { ...p, status: newStatus } : p
      )
    );

  } catch (error) {
    console.error("Status update error:", error);
  }
};

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const changePage = pageNumber => setCurrentPage(pageNumber);

  // Update
  const handleEdit = project => setEditProject(project);

  const handleUpdate = updatedProject => {
    setProjects(prev => prev.map(p => (p._id === updatedProject._id ? updatedProject : p)));
    setFilteredProjects(prev => prev.map(p => (p._id === updatedProject._id ? updatedProject : p)));
    setEditProject(null);
  };

  // Delete
  // const handleDelete = async id => {
  //   if (!window.confirm("Are you sure?")) return;
  //   try {
  //     await axios.delete(`${BASE_URL}/api/admin/projects/${id}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setProjects(prev => prev.filter(p => p._id !== id));
  //     setFilteredProjects(prev => prev.filter(p => p._id !== id));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  
// Delete Project
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this project?")) {
    return;
  }

  try {
    if (!token) {
      throw new Error("Login session missing. Please log in again.");
    }

    // Step 1: Get CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const csrfToken = csrfResponse.data?.csrfToken;

    if (!csrfToken) {
      throw new Error("CSRF token not received from server.");
    }

    // Step 2: Delete project with CSRF token
    await axios.delete(
      `${BASE_URL}/api/admin/projects/${id}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    // Step 3: Update UI after successful deletion
    setProjects((prev) => prev.filter((p) => p._id !== id));

    setFilteredProjects((prev) =>
      prev.filter((p) => p._id !== id)
    );

    alert("Project deleted successfully.");
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.response?.data?.error ||
      err.message ||
      "Failed to delete project."
    );
  }
};


  // ✅ Open Project Dashboard inside AdminDashboard
  const handleOpenProject = (projectId) => {
    setSelectedProjectId(projectId); // send projectId to AdminDashboard
    setActivePage("projectDashboard"); // switch main content
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-6">Project List</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Select
          options={customers}
          value={filters.customer}
          onChange={v => handleFilterChange("customer", v)}
          placeholder="Select Customer"
        />
        <Select
          options={projects.map(p => ({ value: p.projectName, label: p.projectName }))}
          value={filters.project}
          onChange={v => handleFilterChange("project", v)}
          placeholder="Select Project"
        />
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={v => handleFilterChange("status", v)}
          placeholder="Select Status"
        />
        <Select
          options={programmers}
          value={filters.programmer}
          onChange={v => handleFilterChange("programmer", v)}
          placeholder="Search by Programmer"
        />
        <div className="flex gap-2">
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Search
          </button>
          <button onClick={handleReset} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
         <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
  <tr>
    <th className="p-3 border">Sr.</th>
    <th className="p-3 border">Status</th>
    <th className="p-3 border">Survey Id</th>
    <th className="p-3 border">Project Name</th>
    <th className="p-3 border">Customer</th>
    <th className="p-3 border">Sales Person</th>
    <th className="p-3 border">Project Manager</th>
    <th className="p-3 border">Project Type</th>
    <th className="p-3 border text-center">Actions</th>
  </tr>
</thead>

          <tbody>
  {currentProjects.length ? (
    currentProjects.map((project, index) => (
      <tr key={project._id} className="hover:bg-gray-50 transition">
        
        {/* Sr No */}
        <td className="p-3 border text-center font-medium">
          {indexOfFirst + index + 1}
        </td>

        {/* Status Dropdown */}
        <td className="p-3 border text-center">
          <select
            value={project.status}
            onChange={(e) =>
              handleStatusChange(project._id, e.target.value)
            }
           className={`px-2 py-1 rounded text-white text-xs font-semibold ${
  project.status === "Live"
    ? "bg-green-500"
    : project.status === "Paused"
    ? "bg-yellow-500"
    : "bg-red-500"
}`}
          >
            <option value="Live">Live</option>
<option value="Paused">Paused</option>

          </select>
        </td>

        <td className="p-3 border">{project.surveyId}</td>

        {/* Project Name clickable */}
        <td className="p-3 border">
  <div
    className="text-blue-600 cursor-pointer hover:underline font-medium"
    onClick={() => handleOpenProject(project._id)}
  >
    {project.projectName}
  </div>

  {/* Created Date under project name */}
  <div className="text-xs text-gray-500 mt-1">
    Created:{" "}
    {new Date(project.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}{" "}
    |{" "}
    {new Date(project.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </div>
</td>


        {/* Customer Name + Created Date */}
        <td className="p-3 border">
          <div className="font-medium text-gray-800">
            {project.customerName}
          </div>
          
        </td>

        <td className="p-3 border text-sm">
          {(project.salesContact || []).join(", ")}
        </td>

        <td className="p-3 border text-sm">
          {(project.projectManager || []).join(", ")}
        </td>

        <td className="p-3 border">{project.projectType}</td>

        {/* Actions */}
        <td className="p-3 border flex justify-center gap-2">
          <button
            onClick={() => handleEdit(project)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(project._id)}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={9} className="text-center p-6 text-gray-500">
        No projects found
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editProject && (
        <EditProjectModal
          initialData={editProject}
          onSubmit={handleUpdate}
          onClose={() => setEditProject(null)}
        />
      )}

      {/* Group Target Modal */}
      {groupModalProjectId && (
        <GroupTargetModal
          isOpen={!!groupModalProjectId}
          project={projects.find(p => p._id === groupModalProjectId)}
          onClose={() => setGroupModalProjectId(null)}
          onCreate={(data) => {
            console.log("Group Target Created for Project:", groupModalProjectId, data);
            setGroupModalProjectId(null);
          }}
        />
      )}
    </div>
  );
}
