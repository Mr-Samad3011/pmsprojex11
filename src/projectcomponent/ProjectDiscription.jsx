
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProjectDiscription({ project, onClose, onUpdated }) {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    customerName: "",
    invoicingClientContact: "",
    clientProjectLeader: "",
    salesContact: "",
    projectManager: "",
    invoicingMonth: "",
    invoicingYear: "",
  });

  const [options, setOptions] = useState({
    invoicingContacts: [],
    projectLeaders: [],
    salesPersons: [],
    managers: [],
  });
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  /* ================= FETCH CUSTOMER RELATED OPTIONS ================= */
  useEffect(() => {
  if (!project?.customerName) return;

  const fetchCustomerOptions = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/projects/project-options?customerName=${encodeURIComponent(project.customerName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOptions({
        invoicingContacts: res.data.invoicingContacts || [],
        projectLeaders: res.data.projectLeaders || [],
        salesPersons: res.data.salesPersons || [],
        managers: res.data.managers || [],
      });
    } catch (err) {
      console.log("Failed to fetch customer options");
    }
  };

  fetchCustomerOptions();
}, [project]);
  /* ================= PREFILL DATA ================= */
  useEffect(() => {
    if (project) {
      const date = new Date(project.createdAt);

      setFormData({
        customerName: project.customerName || "",
        invoicingClientContact: project.invoicingClientContact?.[0] || "",
        clientProjectLeader: project.clientProjectLeader?.[0] || "",
        salesContact: project.salesContact?.[0] || "",
        projectManager: project.projectManager?.[0] || "",
        invoicingMonth: date.toLocaleString("default", { month: "long" }),
        invoicingYear: date.getFullYear(),
      });
    }
  }, [project]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */

/* ================= SUBMIT WITH CSRF ================= */
const handleSubmit = async () => {
  try {
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      throw new Error("Session expired. Please log in again.");
    }

    // Step 1: Fetch CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const csrfToken = csrfResponse.data?.csrfToken;

    if (!csrfToken) {
      throw new Error("Failed to retrieve CSRF token.");
    }

    // Step 2: Update project details
    const res = await axios.put(
      `${BASE_URL}/api/admin/projects/${project._id}`,
      {
        invoicingClientContact: [
          formData.invoicingClientContact,
        ],
        clientProjectLeader: [
          formData.clientProjectLeader,
        ],
        salesContact: [formData.salesContact],
        projectManager: [formData.projectManager],
      },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    onUpdated(res.data.project);
    onClose();
  } catch (err) {
    console.error(
      "Project update error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Update failed"
    );
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] max-h-[75vh] overflow-y-auto rounded-lg shadow-lg p-4 space-y-3">
        <h2 className="text-md font-semibold border-b pb-2">
          Edit Project Details
        </h2>

        {/* Customer Name Disabled */}
        <InputField
          label="Customer Name"
          value={formData.customerName}
          disabled
        />

        {/* Editable Fields */}
        <SelectField
          label="Invoicing Contact"
          name="invoicingClientContact"
          value={formData.invoicingClientContact}
          options={options.invoicingContacts}
          onChange={handleChange}
        />

        <SelectField
          label="Client Project Leader"
          name="clientProjectLeader"
          value={formData.clientProjectLeader}
          options={options.projectLeaders}
          onChange={handleChange}
        />

        <SelectField
          label="Sales Person"
          name="salesContact"
          value={formData.salesContact}
          options={options.salesPersons}
          onChange={handleChange}
        />

        <SelectField
          label="Project Manager"
          name="projectManager"
          value={formData.projectManager}
          options={options.managers}
          onChange={handleChange}
        />

        {/* Month & Year Disabled */}
        <InputField
          label="Invoicing Month"
          value={formData.invoicingMonth}
          disabled
        />

        <InputField
          label="Invoicing Year"
          value={formData.invoicingYear}
          disabled
        />

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SelectField({ label, name, value, options = [], onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 text-sm"
      >
        <option value="">Select</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function InputField({ label, value, disabled }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <input
        value={value}
        disabled={disabled}
        className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
      />
    </div>
  );
}
