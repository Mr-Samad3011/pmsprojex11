
import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";

export default function BidSpecsPanel({
  groupId,
  initialData = {},
}) {
  const [form, setForm] = useState({
    language: "English",
    country: "United States",
    startDate: "",
    endDate: "",
    incidence: "",
    loi: "",
    completes: "",
    cpi: "",
    total: "",
    quotaDetail: "", // ✅ ADDED
  });

  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  /* =============================
     UPDATE FORM WHEN DATA COMES
  ============================= */
  useEffect(() => {
    if (!initialData?.bidSpecs) return;

    const bid = initialData.bidSpecs;

    setForm({
      language: bid.language || "English",
      country: bid.country || "United States",
      startDate: bid.startDate ? bid.startDate.slice(0, 10) : "",
      endDate: bid.endDate ? bid.endDate.slice(0, 10) : "",
      incidence: bid.incidence || "",
      loi: bid.loi || "",
      completes: bid.completes || "",
      cpi: bid.cpi || "",
      total: bid.total || "",
      quotaDetail: bid.quotaDetail || "", // ✅ ADDED
    });
  }, [initialData]);

  /* =============================
     HANDLE INPUT CHANGE
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      const c = parseFloat(updated.completes) || 0;
      const p = parseFloat(updated.cpi) || 0;

      updated.total = c * p;

      return updated;
    });
  };

  /* =============================
     DOWNLOAD CSV
  ============================= */
  const handleDownload = () => {
    const headers = [
      "Language",
      "Country",
      "Start Date",
      "End Date",
      "Incidence",
      "LOI",
      "Completes",
      "CPI",
      "Total",
      "Quota Detail",
    ];

    const values = [
      form.language,
      form.country,
      form.startDate,
      form.endDate,
      form.incidence,
      form.loi,
      form.completes,
      form.cpi,
      form.total,
      `"${form.quotaDetail}"`, // wrap to preserve commas/new lines
    ];

    const csvContent =
      headers.join(",") + "\n" + values.join(",");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `BidSpecs_${groupId}.csv`;
    link.click();
  };

  /* =============================
     SAVE TO SERVER (PATCH)
  ============================= */
 
/* =============================
   SAVE TO SERVER (PATCH)
============================= */
const handleSave = async () => {
  if (!groupId) {
    alert("Group ID missing");
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Session expired. Please log in again.");
    }

    // Step 1: Fetch CSRF token from backend
    const csrfResponse = await fetch(
      `${BASE_URL}/api/csrf-token`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const csrfData = await csrfResponse.json();

    if (!csrfResponse.ok || !csrfData.csrfToken) {
      throw new Error(
        csrfData.message || "Failed to fetch CSRF token"
      );
    }

    // Step 2: Update Bid Specs with CSRF token
    const res = await fetch(
      `${BASE_URL}/api/groups/update-bidspecs/${groupId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfData.csrfToken,
        },
        body: JSON.stringify({
          bidSpecs: {
            ...form,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Backend error:", data);
      throw new Error(
        data.message || `Request failed (${res.status})`
      );
    }

    alert("Bid Specs updated successfully!");
  } catch (err) {
    console.error("Save error:", err);
    alert(err.message || "Error updating Bid Specs");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white rounded-lg shadow p-5 w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bid Specs</h3>
        <button
          onClick={handleDownload}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          <FaDownload />
        </button>
      </div>

      {/* LANGUAGE & COUNTRY */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div>
          <span className="font-medium">Language: </span>
          <span className="text-blue-600">{form.language}</span>
        </div>
        <div>
          <span className="font-medium">Country: </span>
          <span className="text-blue-600">{form.country}</span>
        </div>
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          { label: "Start Date", name: "startDate", type: "date", readOnly: true }, // ✅ DISABLED
          { label: "End Date", name: "endDate", type: "date" },
          { label: "Incidence (%)", name: "incidence", type: "number" },
          { label: "Median LOI", name: "loi", type: "number" },
          { label: "Completes", name: "completes", type: "number" },
          { label: "CPI ($)", name: "cpi", type: "number" },
          { label: "Total", name: "total", type: "number", readOnly: true },
        ].map((field) => (
          <div
            key={field.name}
            className={field.name === "total" ? "col-span-2" : ""}
          >
            <label className="block font-medium mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              readOnly={field.readOnly}
              disabled={field.readOnly} // ✅ properly disabled
              className={`border rounded px-2 py-1 w-full ${
                field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
        ))}
      </div>

      {/* QUOTA DETAIL TEXTAREA */}
      <div className="mt-4">
        <label className="block font-medium mb-1">
          Quota Detail
        </label>
        <textarea
          name="quotaDetail"
          value={form.quotaDetail}
          onChange={handleChange}
          rows={4}
          className="border rounded px-2 py-2 w-full"
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end mt-5">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-500 text-white px-5 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Bid Specs"}
        </button>
      </div>
    </div>
  );
}