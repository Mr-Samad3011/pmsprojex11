/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import axios from "axios";
import GroupTargetModal from "../pages/admin/GroupTargetModal";
import EditProjectModal from "../pages/admin/EditProjectModal";
import ProjectDiscription from "./ProjectDiscription";
import RedirectUrlsModal from "./RedirecturlModal";
import GroupCard from "./GroupCard";
import { FaPlay, FaPause, FaCheck } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProjectDashboard({
  projectId,
  setActivePage,
  setSelectedGroupId,
}) {
  const [project, setProject] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false); // ✅ new
  const [statusLoading, setStatusLoading] = useState(false);
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const formatMonthYear = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

  /* ================= FETCH PROJECT ================= */
  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProject(res.data);
    } catch (err) {
      console.error("Project fetch error", err);
    }
  };

  
const getCsrfConfig = async () => {
  const authToken = localStorage.getItem("token");

  if (!authToken) {
    throw new Error("Session expired. Please log in again.");
  }

  const response = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  const csrfToken = response.data?.csrfToken;

  if (!csrfToken) {
    throw new Error("Failed to retrieve CSRF token.");
  }

  return {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "X-CSRF-Token": csrfToken,
    },
  };
};

  /* ================= CREATE GROUP ================= */
//  const handleCreateGroup = async (formData) => {
//   try {
//     console.log("Group Data:", formData);

//     const res = await axios.post(
//       `${BASE_URL}/api/groups/create`,
    
//       {
//         ...formData,
//         projectId: projectId, // VERY IMPORTANT
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     console.log("Created Group:", res.data);

//     // ✅ 1. Close modal
//     setShowGroupModal(false);

//     // ✅ 2. Refresh project data
//     await fetchProject();

//     // ✅ 3. IMPORTANT: Open that group dashboard
//     if (res.data?._id) {
//       setSelectedGroupId(res.data._id);
//       setActivePage("groupDashboard"); 
//     }

//   } catch (err) {
//     console.error("Create group error", err);
//   }
// };

const handleCreateGroup = async (formData) => {
  try {
    const config = await getCsrfConfig();

    const res = await axios.post(
      `${BASE_URL}/api/groups/create`,
      {
        ...formData,
        projectId,
      },
      config
    );

    setShowGroupModal(false);

    await fetchProject();

    if (res.data?._id) {
      setSelectedGroupId(res.data._id);
      setActivePage("groupDashboard");
    }
  } catch (err) {
    console.error(
      "Create group error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Failed to create group."
    );
  }
};

// const handleProjectStatusToggle = async () => {
//   if (!project || statusLoading) return;

//   // Completed project ka status change nahi hoga
//   if (project.status === "Completed") {
//     alert("Completed project status cannot be changed.");
//     return;
//   }

//   try {
//     setStatusLoading(true);

//     // Toggle logic
//     const newStatus =
//       project.status === "Live" ? "Paused" : "Live";

//     const { data } = await axios.patch(
//       `${BASE_URL}/api/admin/projects/${projectId}/status`,
//       { status: newStatus },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     console.log("Status updated:", data);

//     // ✅ Optimistic UI update (instant change)
//     setProject((prev) => ({
//       ...prev,
//       status: newStatus,
//     }));

//     // ✅ Optional: full refresh if needed
//     await fetchProject();

//   } catch (err) {
//     console.error("Status update error:", err);

//     alert(
//       err.response?.data?.msg ||
//       err.response?.data?.message ||
//       "Failed to update project status."
//     );
//   } finally {
//     setStatusLoading(false);
//   }
// };


const handleProjectStatusToggle = async () => {
  if (!project || statusLoading) return;

  if (project.status === "Completed") {
    alert("Completed project status cannot be changed.");
    return;
  }

  try {
    setStatusLoading(true);

    const newStatus =
      project.status === "Live" ? "Paused" : "Live";

    const config = await getCsrfConfig();

    const { data } = await axios.patch(
      `${BASE_URL}/api/admin/projects/${projectId}/status`,
      { status: newStatus },
      config
    );

    // Trust the status returned by the backend
    const updatedStatus = data.project?.status ?? newStatus;

    setProject((prev) => ({
      ...prev,
      status: updatedStatus,
    }));

    await fetchProject();
  } catch (err) {
    console.error(
      "Project status update error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Failed to update project status."
    );
  } finally {
    setStatusLoading(false);
  }
};

// const handleGroupStatusToggle = async (group) => {
//   try {

//     if (project.status === "Paused") {
//       alert("Project is paused. Please make project Live first.");
//       return;
//     }

//     const newStatus =
//       group.status === "Live" ? "Paused" : "Live";

//     await axios.patch(
//       `${BASE_URL}/api/groups/${group._id}/status`,
//       { status: newStatus },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     await fetchProject(); // refresh groups

//   } catch (err) {
//     console.error("Group status error:", err);
//   }
// };


const handleGroupStatusToggle = async (group) => {
  try {
    if (!group?._id) {
      throw new Error("Group ID missing.");
    }

    if (project?.status === "Paused") {
      alert("Project is paused. Please make project Live first.");
      return;
    }

    if (group.status === "Completed") {
      alert("Completed group status cannot be changed.");
      return;
    }

    const newStatus =
      group.status === "Live" ? "Paused" : "Live";

    const config = await getCsrfConfig();

    await axios.patch(
      `${BASE_URL}/api/groups/${group._id}/status`,
      { status: newStatus },
      config
    );

    await fetchProject();
  } catch (err) {
    console.error(
      "Group status update error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Failed to update group status."
    );
  }
};


  /* ================= GROUP CLICK HANDLER ================= */
  const handleGroupClick = (groupId) => {
    if (!setSelectedGroupId || !setActivePage) {
      console.error("Navigation props missing!");
      return;
    }

    setSelectedGroupId(groupId);
    setActivePage("groupDashboard");
  };

  const chartData = [
    { day: "Day 1", revenue: 0, expense: 0 },
    { day: "Day 2", revenue: 0, expense: 0 },
    { day: "Day 3", revenue: 0, expense: 0 },
  ];

  if (!project) return <div>Loading project...</div>;

  return (
    <div className="bg-white p-6 rounded border border-blue-300 min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
      <div
  onClick={!statusLoading ? handleProjectStatusToggle : undefined}
  className={`w-9 h-9 rounded-full flex items-center justify-center 
  text-white cursor-pointer transition-all duration-200
  ${
    project.status === "Live"
      ? "bg-green-500 hover:bg-green-600"
      : project.status === "Paused"
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-gray-500"
  }
  ${statusLoading ? "opacity-50 cursor-not-allowed" : ""}
  `}
>
  {project.status === "Live" && <FaPause size={14} />}
  {project.status === "Paused" && <FaPlay size={14} />}
  {project.status === "Completed" && <FaCheck size={14} />}
</div>
          <h2 className="text-2xl font-bold">{project.surveyId}</h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-sky-400 text-white px-4 py-2 rounded hover:bg-sky-500"
          >
            + Add New Survey
          </button>

         {/* ===== Redirects Button ===== */}
          <button
            onClick={() => setShowRedirectModal(true)} // open modal
            className="bg-sky-400 text-white px-4 py-2 rounded hover:bg-sky-500"
          >
            🌐 Redirects
          </button>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-3 gap-6">
        {/* ===== BAR CHART ===== */}
       <div className="col-span-2 border rounded p-4 min-w-0">
  <h3 className="font-semibold mb-3">Bar Chart</h3>

  <BarChart
    width={600}
    height={350}
    data={chartData}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="day" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="revenue" fill="#3b82f6" />
    <Bar dataKey="expense" fill="#10b981" />
  </BarChart>
</div>




        {/* ===== PROJECT DESCRIPTION ===== */}
        <div className="border rounded p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-4">
              Project Description
            </h3>

            <div className="space-y-3 text-sm">
              <Info label="Client Company" value={project.customerName} />
              <Info label="Client Invoice Contact" value={project.invoicingClientContact} />
              <Info label="Client Project Leader" value={project.clientProjectLeader} />
              <Info label="Sales Person" value={project.salesContact} />
              <Info label="Project Manager" value={project.projectManager} />
              
             <Info  label="Invoicing Month" value={formatMonthYear(project.createdAt)} />
              <Info label="Booked Revenue" value={`$ ${project.totalRevenue?.toLocaleString("en-IN") || 0}`} />
            </div>
          </div>

            <button onClick={() => setShowEditModal(true)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg content-end w-5/6" >
            ✏️ Edit Project Details </button>
        </div>
      </div>

      {/* ===== GROUP LIST ===== */}
      <div className="mt-10">
       

        <div className="flex flex-wrap gap-6">
          {project.groups?.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onClick={() => handleGroupClick(group._id)}
               onStatusToggle={handleGroupStatusToggle}
            />
          ))}
        </div>
      </div>

      {/* ===== MODALS ===== */}
      <GroupTargetModal
        isOpen={showGroupModal}
        project={project}
        onClose={() => setShowGroupModal(false)}
        onCreate={handleCreateGroup}
      />

      {showEditModal && (
        <ProjectDiscription
          isOpen={showEditModal}
          project={project}
          onClose={() => setShowEditModal(false)}
          onUpdated={fetchProject}
        />
      )}

       {/* ===== Redirect URLs Modal ===== */}
      {showRedirectModal && (
        <RedirectUrlsModal
          rid={project.surveyId} // use surveyId or project-specific RID
          onClose={() => setShowRedirectModal(false)}
        />
      )}
    </div>
  );
}

/* ===== INFO ROW ===== */
function Info({ label, value }) {
  return (
    <p>
      <b>{label}</b>
      <br />
      {Array.isArray(value)
        ? value.length
          ? value.join(", ")
          : "—"
        : value || "—"}
    </p>
  );
}
