import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaBan } from "react-icons/fa";

export default function EmployeeList() {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState("Employee");

  // ================= FETCH EMPLOYEES =================
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.reverse(); // 🔥 reverse order
      setEmployees(sorted);
    } catch (err) {
      console.error("Fetch Employees Error:", err);
    }
  };

  // ================= FETCH ADMINS =================
  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.reverse(); // 🔥 reverse order
      setAdmins(sorted);
    } catch (err) {
      console.error("Fetch Admins Error:", err);

    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchEmployees(), fetchAdmins()]);
      setLoading(false);
    };
    load();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  
const getCsrfToken = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    { withCredentials: true }
  );

  return response.data.csrfToken;
};


  // ================= UPDATE =================
  // const handleUpdate = async (id) => {
  //   try {
  //     const payload = {
  //       firstName: editForm.firstName,
  //       lastName: editForm.lastName,
  //       email: editForm.email,
  //       position: editForm.position,
  //       contactNumber: editForm.contactNumber,
  //       dob: editForm.dob,
  //       departments: [editForm.departments], // 🔥 dropdown based
  //     };

  //     await axios.put(`${BASE_URL}/api/admin/employees/${id}`, payload, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     setEditingId(null);
  //     fetchEmployees();
  //     fetchAdmins();
  //   } catch (err) {
  //     console.error("Update Error:", err);
  //     console.error("Update status:", err.response?.status);
  // console.error("Update response:", err.response?.data);
  // console.error("Update URL:", err.config?.url);
  // console.error("Update method:", err.config?.method);
  //   }
  // };

  
const handleUpdate = async (id) => {
  try {
    const payload = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      position: editForm.position,
      contactNumber: editForm.contactNumber,
      dob: editForm.dob,
      departments: [editForm.departments],
    };

    const csrfToken = await getCsrfToken();

    await axios.put(
      `${BASE_URL}/api/admin/employees/${id}`,
      payload,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    setEditingId(null);

    await Promise.all([
      fetchEmployees(),
      fetchAdmins(),
    ]);
  } catch (err) {
    console.error("Update Error:", err.response?.data || err.message);
    console.error("Update status:", err.response?.status);
  }
};


  // ================= DELETE =================
  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure?")) return;

  //   try {
  //     await axios.delete(`${BASE_URL}/api/admin/employees/${id}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     fetchEmployees();
  //     fetchAdmins();
  //   } catch (err) {
  //     console.error("Delete Error:", err);
  //   }
  // };

  
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    const csrfToken = await getCsrfToken();

    await axios.delete(
      `${BASE_URL}/api/admin/employees/${id}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    await Promise.all([
      fetchEmployees(),
      fetchAdmins(),
    ]);
  } catch (err) {
    console.error("Delete Error:", err.response?.data || err.message);
    console.error("Delete status:", err.response?.status);
  }
};


  // ================= BLOCK =================
  // const handleBlock = async (id, currentStatus) => {
  //   try {
  //     await axios.put(
  //       `${BASE_URL}/api/admin/employees/block/${id}`,
  //       { blocked: !currentStatus },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     fetchEmployees();
  //     fetchAdmins();
  //   } catch (err) {
  //     console.error("Block Error:", err);
  //   }
  // };

  
const handleBlock = async (id, currentStatus) => {
  try {
    const csrfToken = await getCsrfToken();

    await axios.put(
      `${BASE_URL}/api/admin/employees/block/${id}`,
      { blocked: !currentStatus },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    await Promise.all([
      fetchEmployees(),
      fetchAdmins(),
    ]);
  } catch (err) {
    console.error("Block Error:", err.response?.data || err.message);
    console.error("Block status:", err.response?.status);
  }
};


  if (loading) return <p>Loading...</p>;

  const filteredEmployees =
    activeTab === "Employee" ? employees : admins;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{activeTab} List</h2>

      {/* ================= TABS ================= */}
      <div className="flex mb-4 border-b">
        <button
          onClick={() => setActiveTab("Employee")}
          className={`px-4 py-2 ${
            activeTab === "Employee"
              ? "bg-white border-t border-l border-r"
              : "bg-gray-100"
          }`}
        >
          Employees
        </button>

        <button
          onClick={() => setActiveTab("Admin")}
          className={`px-4 py-2 ${
            activeTab === "Admin"
              ? "bg-white border-t border-l border-r"
              : "bg-gray-100"
          }`}
        >
          Admins
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th>Sr No.</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Contact</th>
              <th>DOB</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp, index) => (
              <tr key={emp._id} className="border-t text-center">
                <td>{index + 1}</td>

                <td>{emp.userId}</td>

                <td>
                  {editingId === emp._id ? (
                    <>
                      <input
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleChange}
                        className="border px-1 w-20"
                      />
                      <input
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleChange}
                        className="border px-1 w-20"
                      />
                    </>
                  ) : (
                    `${emp.firstName} ${emp.lastName}`
                  )}
                </td>

                <td>
                  {editingId === emp._id ? (
                    <input
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      className="border px-1 w-36"
                    />
                  ) : (
                    emp.email
                  )}
                </td>

                <td>
                  {editingId === emp._id ? (
                    <select
                      name="departments"
                      value={editForm.departments}
                      onChange={handleChange}
                      className="border px-1"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    emp.departments?.[0]
                  )}
                </td>

                <td>
                  {editingId === emp._id ? (
                    <input
                      name="position"
                      value={editForm.position}
                      onChange={handleChange}
                      className="border px-1 w-28"
                    />
                  ) : (
                    emp.position || "-"
                  )}
                </td>

                <td>
                  {editingId === emp._id ? (
                    <input
                      name="contactNumber"
                      value={editForm.contactNumber}
                      onChange={handleChange}
                      className="border px-1 w-28"
                    />
                  ) : (
                    emp.contactNumber || "-"
                  )}
                </td>

                <td>
                  {editingId === emp._id ? (
                    <input
                      type="date"
                      name="dob"
                      value={editForm.dob}
                      onChange={handleChange}
                      className="border px-1"
                    />
                  ) : emp.dob ? (
                    new Date(emp.dob).toLocaleDateString("en-IN")
                  ) : (
                    "-"
                  )}
                </td>

                <td className="flex justify-center gap-2">
                  {editingId === emp._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(emp._id)}
                        className="bg-green-500 text-white px-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-2"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(emp._id);
                          setEditForm({
                            firstName: emp.firstName,
                            lastName: emp.lastName,
                            email: emp.email,
                            position: emp.position || "",
                            contactNumber: emp.contactNumber || "",
                            dob: emp.dob
                              ? emp.dob.split("T")[0]
                              : "",
                            departments: emp.departments?.[0],
                          });
                        }}
                        className="bg-blue-500 text-white px-2"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="bg-red-500 text-white px-2"
                      >
                        <FaTrash />
                      </button>

                      <button
                        onClick={() =>
                          handleBlock(emp._id, emp.blocked)
                        }
                        className="bg-gray-600 text-white px-2"
                      >
                        <FaBan />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
