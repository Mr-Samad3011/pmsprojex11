import { useEffect, useState } from "react";
import axios from "axios";

export default function AssignProject() {
  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  /* ================= LOAD PROJECTS ================= */
  const fetchProjects = async () => {
    try {
      const res = await axios.get("/api/assign/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ================= OPEN ASSIGN MODAL ================= */
  const openAssignModal = async (project) => {
    setSelectedProject(project);

    // ✅ convert populated objects → ids
    const assignedIds =
      project.assignedEmployees?.map((e) => e._id) || [];
    setSelectedEmployees(assignedIds);

    setLoadingEmployees(true);

    const res = await axios.get("/api/assign/employees", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setEmployees(res.data || []);
    setLoadingEmployees(false);
  };

  /* ================= ASSIGN PROJECT ================= */
  const assignProject = async () => {
    if (!selectedEmployees.length) {
      alert("Select at least one employee");
      return;
    }

    await axios.post(
      "/api/assign/projects/assign",
      {
        projectId: selectedProject._id,
        employeeIds: selectedEmployees
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Project assigned successfully");
    setSelectedProject(null);
    fetchProjects();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Assign Projects</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Project Name</th>
            <th className="border p-2">Survey ID</th>
            <th className="border p-2">Assigned Count</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No projects found
              </td>
            </tr>
          ) : (
            projects.map((p) => (
              <tr key={p._id}>
                <td className="border p-2">{p.projectName}</td>
                <td className="border p-2">{p.surveyId}</td>
                <td className="border p-2">
                  {p.assignedEmployees?.length || 0}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => openAssignModal(p)}
                    className="bg-teal-600 text-white px-3 py-1 rounded"
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-5 rounded w-96">
            <h3 className="font-semibold mb-2">
              Assign Employees – {selectedProject.projectName}
            </h3>

            {loadingEmployees ? (
              <p>Loading...</p>
            ) : (
              employees.map((emp) => (
                <label key={emp._id} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp._id)}
                    onChange={() =>
                      setSelectedEmployees((prev) =>
                        prev.includes(emp._id)
                          ? prev.filter((id) => id !== emp._id)
                          : [...prev, emp._id]
                      )
                    }
                  />{" "}
                  {emp.firstName} {emp.lastName} ({emp.userId})
                </label>
              ))
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setSelectedProject(null)}>
                Cancel
              </button>
              <button
                onClick={assignProject}
                className="bg-teal-600 text-white px-3 py-1 rounded"
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
