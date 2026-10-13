/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import axios from "axios";

export default function AssignProject() {
  const [activeTab, setActiveTab] = useState("assign");
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [filters, setFilters] = useState({
    assign: { projectName: "", customerName: "", employeeName: "" },
    assigned: { projectName: "", customerName: "", employeeName: "" },
    history: { projectName: "", employeeName: "" },
  });

  const [currentPage, setCurrentPage] = useState({ assign: 1, assigned: 1, history: 1 });
  const itemsPerPage = 20;

  const token = localStorage.getItem("token");
 const authHeader = {
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${token}`,
  },
};


const getCsrfToken = async () => {
  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  const response = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const csrfToken = response.data?.csrfToken;

  if (!csrfToken) {
    throw new Error("CSRF token was not received from server.");
  }

  return csrfToken;
};


  /* ================= FETCH ================= */

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/api/admin/projects/all", authHeader);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Fetch projects failed", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/admin/employees", authHeader);
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Fetch employees failed", err);
    }
  };

  const fetchHistory = async () => {
    try {
      if (!token) {
        console.error("No token found. Please login first.");
        return;
      }
      const res = await axios.get(`${BASE_URL}/api/admin/projects/history`, authHeader);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Fetch history failed", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchHistory();
  }, []);

  /* ================= ASSIGN ================= */

//   const openAssignModal = (project) => {
//   setSelectedProject(project);

//   // Get already assigned employee IDs
//   const assignedIds = project.assignedEmployees?.map(e => e._id || e) || [];

//   // Preselect only the already assigned employees
//   setSelectedEmployees(assignedIds);

//   // Fetch all employees but filter out already assigned ones for modal display
//   fetchEmployees().then(() => {
//     setEmployees(prev =>
//       prev.filter(e => !assignedIds.includes(e._id))
//     );
//   });
// };

const openAssignModal = (project) => {
  setSelectedProject(project);

  // Already assigned employee IDs
  const assignedIds = project.assignedEmployees?.map(e => e._id || e) || [];
  setSelectedEmployees(assignedIds);

  // Fetch all employees and filter out already assigned
  fetchEmployees().then(() => {
    setEmployees(prev => prev.filter(e => !assignedIds.includes(e._id)));
  });
};

  // const assignProject = async () => {
  //   try {
  //     await axios.post(
  //       "/api/admin/projects/assign",
  //       { projectId: selectedProject._id, employeeIds: selectedEmployees },
  //       authHeader
  //     );
  //     alert("Project assigned successfully");
  //     setSelectedProject(null);
  //     fetchProjects();
  //     fetchHistory();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Assignment failed");
  //   }
  // };

const assignProject = async () => {
  try {
    if (!selectedProject) {
      throw new Error("Please select a project.");
    }

    const csrfToken = await getCsrfToken();

    await axios.post(
      `${BASE_URL}/api/admin/projects/assign`,
      {
        projectId: selectedProject._id,
        employeeIds: selectedEmployees,
      },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    alert("Project assigned successfully");

    setSelectedProject(null);
    setSelectedEmployees([]);

    await fetchProjects();
    await fetchHistory();
  } catch (err) {
    console.error("ASSIGN PROJECT ERROR:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.response?.data?.error ||
      err.message ||
      "Assignment failed"
    );
  }
};

  // const removeEmployee = async (projectId, employeeId) => {
  //   if (!window.confirm("Remove employee from project?")) return;
  //   try {
  //     await axios.post("/api/admin/projects/remove", { projectId, employeeId }, authHeader);
  //     fetchProjects();
  //     fetchHistory();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Remove failed");
  //   }
  // };

  
const removeEmployee = async (projectId, employeeId) => {
  if (!window.confirm("Remove employee from project?")) {
    return;
  }

  try {
    const csrfToken = await getCsrfToken();

    await axios.post(
      `${BASE_URL}/api/admin/projects/remove`,
      {
        projectId,
        employeeId,
      },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    await fetchProjects();
    await fetchHistory();

    alert("Employee removed successfully");
  } catch (err) {
    console.error("REMOVE EMPLOYEE ERROR:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.response?.data?.error ||
      err.message ||
      "Remove failed"
    );
  }
};

  /* ================= FILTER HANDLER ================= */

  const handleFilterChange = (tab, field, value) => {
    setFilters(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value }
    }));
    setCurrentPage(prev => ({ ...prev, [tab]: 1 }));
  };

  /* ================= FILTERED DATA ================= */

  const getFilteredProjects = (tab) => {
    let data = projects;
    if (tab === "assign") {
      data = data.filter(p =>
        p.projectName.toLowerCase().includes(filters.assign.projectName.toLowerCase()) &&
        p.customerName.toLowerCase().includes(filters.assign.customerName.toLowerCase()) &&
        (filters.assign.employeeName === "" ||
          p.assignedEmployees?.some(e =>
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(filters.assign.employeeName.toLowerCase())
          ))
      );
    } else if (tab === "assigned") {
      data = data.filter(p =>
        p.assignedEmployees?.length &&
        p.projectName.toLowerCase().includes(filters.assigned.projectName.toLowerCase()) &&
        p.customerName.toLowerCase().includes(filters.assigned.customerName.toLowerCase()) &&
        (filters.assigned.employeeName === "" ||
          p.assignedEmployees.some(e =>
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(filters.assigned.employeeName.toLowerCase())
          ))
      );
    }
    return [...data].reverse(); // newest first
  };

 const getFilteredHistory = () => {
  // Filter first
  let data = history.filter(h =>
    (filters.history.projectName === "" || h.project?.projectName.toLowerCase().includes(filters.history.projectName.toLowerCase())) &&
    (filters.history.employeeName === "" ||
      (h.employee &&
        `${h.employee.firstName} ${h.employee.lastName}`.toLowerCase().includes(filters.history.employeeName.toLowerCase())))
  );

  // Reverse for newest first
  return data.slice().reverse(); // slice() to avoid mutating original array
};


  /* ================= PAGINATION ================= */

  const paginateData = (data, tab) => {
    const page = currentPage[tab];
    const total = data.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const indexOfLast = page * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return {
      paginated: data.slice(indexOfFirst, indexOfLast),
      totalPages
    };
  };

  const changePage = (tab, pageNumber) =>
    setCurrentPage(prev => ({ ...prev, [tab]: pageNumber }));

  /* ================= UI ================= */

  return (
    <div className="bg-white p-6 rounded shadow w-full">

      
      {/* TABS */}
      <div className="flex gap-6 border-b mb-4">
        {["assign", "assigned", "history"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${activeTab === tab ? "border-b-2 border-teal-600 font-semibold" : ""}`}
          >
            {tab === "assign" && "Assign Project"}
            {tab === "assigned" && "Assigned Projects"}
            {tab === "history" && "Assignment History"}
          </button>
        ))}
      </div>

      {/* ================= FILTERS ================= */}
      {activeTab === "assign" && (
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            placeholder="Project Name"
            className="border px-2 py-1 rounded flex-1"
            value={filters.assign.projectName}
            onChange={e => handleFilterChange("assign", "projectName", e.target.value)}
          />
          <input
            placeholder="Customer Name"
            className="border px-2 py-1 rounded flex-1"
            value={filters.assign.customerName}
            onChange={e => handleFilterChange("assign", "customerName", e.target.value)}
          />
          <input
            placeholder="Assigned Employee"
            className="border px-2 py-1 rounded flex-1"
            value={filters.assign.employeeName}
            onChange={e => handleFilterChange("assign", "employeeName", e.target.value)}
          />
        </div>
      )}

      {activeTab === "assigned" && (
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            placeholder="Project Name"
            className="border px-2 py-1 rounded flex-1"
            value={filters.assigned.projectName}
            onChange={e => handleFilterChange("assigned", "projectName", e.target.value)}
          />
          <input
            placeholder="Customer Name"
            className="border px-2 py-1 rounded flex-1"
            value={filters.assigned.customerName}
            onChange={e => handleFilterChange("assigned", "customerName", e.target.value)}
          />
          <input
            placeholder="Employee Name"
            className="border px-2 py-1 rounded flex-1"
            value={filters.assigned.employeeName}
            onChange={e => handleFilterChange("assigned", "employeeName", e.target.value)}
          />
        </div>
      )}

      {activeTab === "history" && (
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            placeholder="Project Name"
            className="border px-2 py-1 rounded flex-1"
            value={filters.history.projectName}
            onChange={e => handleFilterChange("history", "projectName", e.target.value)}
          />
          <input
            placeholder="Employee Name"
            className="border px-2 py-1 rounded flex-1"
            value={filters.history.employeeName}
            onChange={e => handleFilterChange("history", "employeeName", e.target.value)}
          />
        </div>
      )}

      {/* ================= TABLES ================= */}
      {/* ASSIGN TAB */}
      {activeTab === "assign" && (() => {
        const { paginated, totalPages } = paginateData(getFilteredProjects("assign"), "assign");
        return (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Sr. No</th>
                  <th className="border px-2 py-1">Project</th>
                  <th className="border px-2 py-1">Customer</th>
                  <th className="border px-2 py-1">Assigned</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length ? paginated.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{(currentPage.assign - 1) * itemsPerPage + idx + 1}</td>
                    <td className="border px-2 py-1">{p.projectName}</td>
                    <td className="border px-2 py-1">{p.customerName}</td>
                    <td className="border px-2 py-1">{p.assignedEmployees?.length || 0}</td>
                    <td className="border px-2 py-1">
                      <button className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700" onClick={() => openAssignModal(p)}>Assign </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center p-4">No projects found</td></tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i+1} onClick={() => changePage("assign", i+1)} className={`px-3 py-1 rounded ${currentPage.assign===i+1 ? "bg-teal-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{i+1}</button>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* ASSIGNED TAB */}
      {activeTab === "assigned" && (() => {
        const { paginated, totalPages } = paginateData(getFilteredProjects("assigned"), "assigned");
        return (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Sr. No</th>
                  <th className="border px-2 py-1">Project</th>
                  <th className="border px-2 py-1">Employees</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{(currentPage.assigned - 1) * itemsPerPage + idx + 1}</td>
                    <td className="border px-2 py-1">{p.projectName}</td>
                    <td className="border px-2 py-1">
                      {p.assignedEmployees.map(e => (
                        <div key={e._id} className="flex justify-between items-center border p-1 mb-1 rounded">
                          <span>{e.firstName} {e.lastName} ({e.userId})</span>
                          <button className="text-red-600" onClick={() => removeEmployee(p._id, e._id)}>❌</button>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i+1} onClick={() => changePage("assigned", i+1)} className={`px-3 py-1 rounded ${currentPage.assigned===i+1 ? "bg-teal-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{i+1}</button>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* HISTORY TAB */}
      {activeTab === "history" && (() => {
        const data = getFilteredHistory();
        const { paginated, totalPages } = paginateData(data, "history");

        return (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Sr. No</th>
                  <th className="border px-2 py-1">Project</th>
                  <th className="border px-2 py-1">Employee</th>
                  <th className="border px-2 py-1">Action</th>
                  <th className="border px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((h, idx) => (
                  <tr key={h._id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{(currentPage.history-1)*itemsPerPage + idx + 1}</td>
                    <td className="border px-2 py-1">{h.project?.projectName || "-"}</td>
                    <td className="border px-2 py-1">{h.employee ? `${h.employee.firstName} ${h.employee.lastName} (${h.employee.userId})` : "-"}</td>
                    <td className="border px-2 py-1">{h.action}</td>
                    <td className="border px-2 py-1">{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages>1 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i+1} onClick={()=>changePage("history",i+1)} className={`px-3 py-1 rounded ${currentPage.history===i+1?"bg-teal-600 text-white":"bg-gray-200 hover:bg-gray-300"}`}>{i+1}</button>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* ================= MODAL ================= */}
     {selectedProject && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-5 w-full max-w-md rounded shadow-lg">
      <h3 className="font-semibold mb-3">
        Assign Employees – {selectedProject.projectName}
      </h3>

      <div className="max-h-60 overflow-y-auto border p-2 rounded">
        {employees.length > 0 ? (
          employees.map(e => (
            <label key={e._id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={selectedEmployees.includes(e._id)}
                onChange={() =>
                  setSelectedEmployees(prev =>
                    prev.includes(e._id)
                      ? prev.filter(id => id !== e._id)
                      : [...prev, e._id]
                  )
                }
              />
              <span>{e.firstName} {e.lastName}</span>
            </label>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            All employees are already assigned to this project
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setSelectedProject(null)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={assignProject}
          className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
