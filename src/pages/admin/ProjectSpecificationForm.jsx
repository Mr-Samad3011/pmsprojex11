import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProjectSpecificationForm() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);

  // Detail Page
  const [detail, setDetail] = useState({
    sampleType: "",
    studyType: "",
    collectsPII: "No",
    countryName: "",
  });

  // Quota Details (dynamic)
  const [quotas, setQuotas] = useState([{ quotaName: "", value: "" }]);

  // Vendor Management (dynamic)
  const [vendors, setVendors] = useState([
    { vendorCPI: "", vendorCode: "", CPI: "", vendorQuota: [{ vendorCode: "", quota: "" }] },
  ]);

  const token = localStorage.getItem("token");

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch projects");
      }
    };
    fetchProjects();
  }, [token]);

  // Fetch project specification when project selected
  useEffect(() => {
    if (!selectedProject) return;
    const fetchProjectSpec = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/project-specification/${selectedProject}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setDetail(res.data.detail || detail);
          setQuotas(res.data.quotas.length ? res.data.quotas : quotas);
          setVendors(res.data.vendors.length ? res.data.vendors : vendors);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectSpec();
  }, [selectedProject]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetail({ ...detail, [name]: value });
  };

  // Quota handlers
  const handleQuotaChange = (index, field, value) => {
    const newQuotas = [...quotas];
    newQuotas[index][field] = value;
    setQuotas(newQuotas);
  };
  const addQuotaRow = () => setQuotas([...quotas, { quotaName: "", value: "" }]);
  const removeQuotaRow = (index) => setQuotas(quotas.filter((_, i) => i !== index));

  
  

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { detail, quotas, vendors };
      await axios.post(`/api/project-specification/${selectedProject}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Project specification saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save project specification");
    }
  };

  return (
  <div className="w-full flex justify-center px-3 sm:px-4 md:px-6">
    <div className="w-full max-w-5xl bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">
        Project Specification Form
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Project Select */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Select Project / Survey
          </label>
          <select
            className="w-full border p-2 rounded"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            required
          >
            <option value="">--Select Project--</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName} ({p.surveyId})
              </option>
            ))}
          </select>
        </div>

        {/* ================= Detail Page ================= */}
        <h3 className="font-semibold text-lg mt-6 mb-3">Detail Page</h3>

        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          {/* Row 1 */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <label className="md:w-32 text-sm font-medium">Sample Type</label>
            <input
              type="text"
              name="sampleType"
              className="border p-2 rounded flex-1"
              value={detail.sampleType}
              onChange={handleDetailChange}
            />

            <label className="md:w-32 text-sm font-medium">Study Type</label>
            <input
              type="text"
              name="studyType"
              className="border p-2 rounded flex-1"
              value={detail.studyType}
              onChange={handleDetailChange}
            />
          </div>

          {/* Row 2 */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <label className="md:w-32 text-sm font-medium">Collects PII</label>
            <select
              name="collectsPII"
              className="border p-2 rounded flex-1"
              value={detail.collectsPII}
              onChange={handleDetailChange}
            >
              <option>No</option>
              <option>Yes</option>
            </select>

            <label className="md:w-32 text-sm font-medium">
              Country / Language
            </label>
            <input
              type="text"
              name="countryName"
              className="border p-2 rounded flex-1"
              value={detail.countryName}
              onChange={handleDetailChange}
            />
          </div>

          {/* Row 3 */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <label className="md:w-32 text-sm font-medium">IR</label>
            <input
              type="text"
              name="IR"
              className="border p-2 rounded flex-1"
              value={detail.IR || ""}
              onChange={handleDetailChange}
            />

            <label className="md:w-32 text-sm font-medium">LOI</label>
            <input
              type="text"
              name="LOI"
              className="border p-2 rounded flex-1"
              value={detail.LOI || ""}
              onChange={handleDetailChange}
            />
          </div>
        </div>

        {/* ================= Quota Detail ================= */}
        <h3 className="font-semibold text-lg mt-6 mb-3">Quota Detail</h3>

        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          {quotas.map((q, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center gap-3 relative group"
            >
              <label className="md:w-32 text-sm font-medium">Quota Name</label>
              <input
                className="border p-2 rounded flex-1"
                value={q.quotaName}
                onChange={(e) =>
                  handleQuotaChange(idx, "quotaName", e.target.value)
                }
              />

              <label className="md:w-24 text-sm font-medium">Value</label>
              <input
                className="border p-2 rounded md:w-40"
                value={q.value}
                onChange={(e) =>
                  handleQuotaChange(idx, "value", e.target.value)
                }
              />

              {/* Hover Buttons */}
              <div className="md:absolute md:right-0 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={addQuotaRow}
                  className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                >
                  Add
                </button>
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeQuotaRow(idx)}
                    className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ================= Vendor Management ================= */}
        <h3 className="font-semibold text-lg mt-6 mb-3">
          Vendor Management
        </h3>

        {/* Vendor CPI */}
        <h4 className="font-semibold mt-4 mb-2">Vendor CPI</h4>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-40 text-sm font-medium">Vendor Code</label>
            <input className="border p-2 rounded flex-1" />

            <label className="md:w-24 text-sm font-medium">CPI</label>
            <input className="border p-2 rounded md:w-40" />
          </div>
        </div>

        {/* Vendor Quota */}
        <h4 className="font-semibold mt-6 mb-2">Vendor Quota</h4>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-40 text-sm font-medium">Vendor Code</label>
            <input className="border p-2 rounded flex-1" />

            <label className="md:w-24 text-sm font-medium">Quota</label>
            <input className="border p-2 rounded md:w-40" />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
          >
            Save Specification
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
