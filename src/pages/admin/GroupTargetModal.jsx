/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Country } from "country-state-city";
import Select from "react-select";

  const FieldWithCheck = ({ children, value, right = "right-3" }) => {
  return (
    <div className="relative w-full">
      
      {/* Input / Select */}
      {children}

      {/* Check Icon */}
      <span
        className={`absolute ${right} top-1/2 -translate-y-1/2 text-green-500 transition-opacity duration-200 ${
          value ? "opacity-100" : "opacity-0"
        } pointer-events-none`}
      >
        <FaCheck />
      </span>

    </div>
  );
};
export default function GroupTargetModal({ isOpen, project, onClose, onCreate }) {
  const [form, setForm] = useState({
    groupName: "",
    country: "",
    language: "",
    startDate: "",
    endDate: "",
    incidence: "",
    loi: "",
    completes: "",
    cpi: "",
    total: "",
    quotaDetail: "", 
  });
  const [languages, setLanguages] = useState([]);
  const [dateError, setDateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const countries = useMemo(
    () => Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // Reset form when modal opens
  // useEffect(() => {
  //   if (isOpen) {
  //     setForm({
  //       groupName: "",
  //       country: "",
  //       language: "",
  //       startDate: "",
  //       endDate: "",
  //       incidence: "",
  //       loi: "",
  //       completes: "",
  //       cpi: "",
  //       total: "",
  //     });
  //     setDateError("");
  //   }
  // }, [isOpen]);

  useEffect(() => {
  if (isOpen) {
    const today = new Date().toISOString().split("T")[0];

    setForm({
      groupName: "",
      country: "",
      language: "",
      startDate: today, // ✅ AUTO CURRENT DATE
      endDate: "",
      incidence: "",
      loi: "",
      completes: "",
      cpi: "",
      total: "",
      quotaDetail: "",
    });

    setDateError("");
  }
}, [isOpen]);

  // Fetch languages from API
useEffect(() => {
  if (!isOpen) return;

  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/languages`);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Languages API error details:", result);

        throw new Error(
          result.details ||
          result.message ||
          `API failed: ${response.status}`
        );
      }

      if (!Array.isArray(result)) {
        throw new Error("Invalid API response: Expected an array of languages");
      }

      setLanguages(result);
    } catch (error) {
      console.error("Language fetch error:", error.message);
      setLanguages([]);
    }
  };

  fetchLanguages();
}, [isOpen, BASE_URL]);
  

  if (!isOpen) return null;

  // Handle input changes
  const handleChange = (e) => {
  const { name, value } = e.target;

  const updatedForm = { ...form, [name]: value };

  // 🔥 Total = completes + cpi
  const c = parseFloat(updatedForm.completes) || 0;
  const p = parseFloat(updatedForm.cpi) || 0;

  updatedForm.total =
    updatedForm.completes || updatedForm.cpi
      ? (c * p).toFixed(2)
      : "";

  // Date validation
  if (updatedForm.startDate && updatedForm.endDate) {
    setDateError(
      new Date(updatedForm.startDate) > new Date(updatedForm.endDate)
        ? "Start Date cannot be after End Date"
        : ""
    );
  }

  setForm(updatedForm);
};

  const handleSelectChange = (name, selected) => {
  const updatedForm = {
    ...form,
    [name]: selected ? selected.value : "",
  };

  // 🔥 Total = completes + cpi
  const c = parseFloat(updatedForm.completes) || 0;
  const p = parseFloat(updatedForm.cpi) || 0;

  updatedForm.total = c * p;

  setForm(updatedForm);
};


  // Handle Create -> API call

const handleCreate = async () => {
  if (isSubmitting) return;

  if (
    !form.groupName ||
    !form.country ||
    !form.language ||
    !form.startDate ||
    !form.endDate ||
    dateError
  ) {
    console.error("Form incomplete, cannot create group");
    return;
  }

  setIsSubmitting(true);

  try {
    const payload = {
      projectId: project._id,
      groupName: form.groupName,
      bidSpecs: {
        groupName: form.groupName,
        country: form.country || null,
        language: form.language || null,
        startDate: form.startDate
          ? new Date(form.startDate)
          : null,
        endDate: form.endDate
          ? new Date(form.endDate)
          : null,
        incidence: Number(form.incidence) || 0,
        loi: Number(form.loi) || 0,
        completes: Number(form.completes) || 0,
        cpi: Number(form.cpi) || 0,
        total: Number(form.total) || 0,
        quotaDetail: form.quotaDetail || "",
      },
    };

    const token = localStorage.getItem("token");

    // Step 1: Fetch CSRF token and receive its cookie
    const csrfRes = await fetch(
      `${BASE_URL}/api/csrf-token`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!csrfRes.ok) {
      throw new Error(
        `CSRF token fetch failed: ${csrfRes.status} ${await csrfRes.text()}`
      );
    }

    const { csrfToken } = await csrfRes.json();

    if (!csrfToken) {
      throw new Error("CSRF token was not returned by the server");
    }

    // Step 2: Create group with CSRF token
    const res = await fetch(`${BASE_URL}/api/groups/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        responseData.message ||
        responseData.error ||
        `Failed to create group: ${res.status}`
      );
    }

    console.log("Group created:", responseData);
    onCreate(responseData);
    onClose();
  } catch (err) {
    console.error("Create group error:", err);
  } finally {
    setIsSubmitting(false);
  }
};



 const isCreateDisabled =
  !form.groupName ||
  !form.country ||
  !form.language ||
  !form.startDate ||
  !form.endDate ||
  !!dateError ||
  isSubmitting; // disable while submitting





  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-2xl relative overflow-y-auto max-h-[90vh] border-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Group Target for {project?.projectName || "Project"}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Row 1: Name, Country, Language */}
          <div className="flex flex-col md:flex-row gap-3">
        <div className="flex flex-col w-full">
  <label className="text-sm font-medium text-gray-700 mb-1">
    Group Name
  </label>
  <FieldWithCheck value={form.groupName}>
    <input
      type="text"
      name="groupName"
      value={form.groupName}
      onChange={handleChange}
      placeholder="Enter Group Name"
      className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
    />
  </FieldWithCheck>
</div>


           <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">
    Country
  </label>
            <FieldWithCheck value={form.country}>
              <Select
                options={countries.map((c) => ({ value: c.name, label: c.name }))}
                value={form.country ? { value: form.country, label: form.country } : null}
                onChange={(selected) => handleSelectChange("country", selected)}
                placeholder="Select Country"
                styles={{ control: (base) => ({ ...base, paddingRight: "30px" }) }}
              />
            </FieldWithCheck>
</div>

         <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">
    Language
  </label>
            <FieldWithCheck value={form.language}>
              <Select
                options={languages.map((lang) => ({ value: lang, label: lang }))}
                value={form.language ? { value: form.language, label: form.language } : null}
                onChange={(selected) => handleSelectChange("language", selected)}
                placeholder="Select Language"
                styles={{ control: (base) => ({ ...base, paddingRight: "30px" }) }}
              />
            </FieldWithCheck>
            </div>
          </div>

          {/* Row 2: Dates */}
          <div className="flex flex-col md:flex-row gap-3">

  {/* Start Date */}
  <div className="flex flex-col w-full">
    <label className="text-sm font-medium text-gray-700 mb-1">
      Start Date
    </label>
    <FieldWithCheck value={form.startDate}>
      <input
  type="date"
  name="startDate"
  value={form.startDate}
  disabled
  readOnly
  className="border px-3 py-2 pr-10 rounded w-full bg-gray-100 cursor-not-allowed"
/>
    </FieldWithCheck>
  </div>

  {/* End Date */}
  <div className="flex flex-col w-full">
    <label className="text-sm font-medium text-gray-700 mb-1">
      End Date
    </label>
    <FieldWithCheck value={form.endDate}>
      <input
        type="date"
        name="endDate"
        value={form.endDate}
        onChange={handleChange}
        className="border px-3 py-2 pr-10 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </FieldWithCheck>
  </div>

</div>


          {dateError && <p className="text-red-500 text-sm">{dateError}</p>}

          {/* Target Specs */}
          <h3 className="text-lg font-semibold">Target Specs</h3>
          <div className="flex flex-col md:flex-row gap-3">

  {[
    { name: "incidence", label: "Incidence %" },
    { name: "loi", label: "LOI (min)" },
    { name: "completes", label: "Completes" },
    { name: "cpi", label: "CPI ($)" },
  ].map((field) => (
    <div key={field.name} className="flex flex-col w-full">
      
      <label className="text-sm font-medium text-gray-700 mb-1">
        {field.label}
      </label>

      <FieldWithCheck value={form[field.name]}>
        <input
          type="number"
          name={field.name}
          value={form[field.name]}
          onChange={handleChange}
          min="0"
          step="any"
          className="border px-3 py-2 pr-10 rounded w-full 
                     focus:ring-2 focus:ring-blue-400 
                     focus:outline-none"
        />
      </FieldWithCheck>

    </div>
  ))}

</div>

{/* Quota Detail */}
<div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">
    Quota Detail
  </label>


  <textarea
    name="quotaDetail"
    value={form.quotaDetail}
    onChange={handleChange}
    rows={4}
    placeholder="Enter quota details..."
    className="border px-3 py-2 rounded w-full 
               focus:ring-2 focus:ring-blue-400 
               focus:outline-none resize-none"
  />
</div>


          {/* Total */}
         {/* Total */}
<FieldWithCheck value={form.total}>
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">
      Total
    </label>

    <input
      type="number"
      name="total"
      value={form.total}
      readOnly
      className="border px-2 py-2 rounded w-1/3 mt-1 bg-gray-100 cursor-not-allowed"
    />
  </div>
</FieldWithCheck>


          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">

  {/* Create Button */}
  <button
    type="button"
    onClick={handleCreate}
    disabled={isCreateDisabled}
    className={`px-6 py-2 rounded-md font-medium text-white transition-all duration-200  active:scale-95
${
      isCreateDisabled
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-gray-600 to-green-500 hover:from-gray-700 hover:to-green-600 shadow-md hover:shadow-lg "
    }`}
  >
    Create
  </button>

  {/* Cancel Button */}
  <button
    type="button"
    onClick={onClose}
    className="px-6 py-2 rounded-md font-medium text-white bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 shadow-md hover:shadow-lg transition-all duration-200"
  >
    Cancel
  </button>

</div>

        </div>
      </div>
    </div>
  );
}
