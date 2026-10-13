/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaSave } from "react-icons/fa";

export default function AddSupplier() {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const [form, setForm] = useState({
    supplierName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "India",
    zip: "",
    completeUrl: "",
    terminateUrl: "",
    quotafullUrl: "",
    securityTerminateUrl: "",
  });

  /* ================= HANDLERS ================= */

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (!token) {
      throw new Error("Admin not logged in");
    }

    // Step 1: Fetch CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
      }
    );

    const csrfToken = csrfResponse.data.csrfToken;

    // Step 2: Add supplier with CSRF token
    await axios.post(
      `${BASE_URL}/api/admin/suppliers`,
      form,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    alert("Supplier Added Successfully");

    // Reset form after successful submission
    setForm({
      supplierName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "India",
      zip: "",
      completeUrl: "",
      terminateUrl: "",
      quotafullUrl: "",
      securityTerminateUrl: "",
    });
  } catch (err) {
    console.error(
      "ADD SUPPLIER ERROR:",
      err.response?.status,
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Failed to add supplier"
    );
  }
};


  return (
    <div className="max-w-5xl mx-auto bg-white shadow rounded p-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between mb-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-black">
          <FaArrowLeft /> Back to Supplier List
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-6">Add New Supplier</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ===== BASIC ===== */}
        <Section title="Supplier Information">
          <Input
            label="Supplier Name *"
            name="supplierName"
            onChange={handleInput}
            required
          />
        </Section>

        {/* ===== ADDRESS ===== */}
        <Section title="Address Details">
          <Input
            label="Address Line 1 *"
            name="address1"
            onChange={handleInput}
            required
          />
          <Input
            label="Address Line 2 *"
            name="address2"
            onChange={handleInput}
            required
          />

          <TwoCol>
            <Input label="City *" name="city" onChange={handleInput} required />
            <Input label="State *" name="state" onChange={handleInput} required />
          </TwoCol>

          <TwoCol>
            <Input label="Zip *" name="zip" onChange={handleInput} required />
            <Input label="Country *" name="country" value="India" disabled />
          </TwoCol>
        </Section>

        {/* ===== REDIRECT URLS ===== */}
        <Section title="Redirect URLs">
          <Input
            label="Complete URL *"
            name="completeUrl"
            placeholder="http://www.website.com"
            onChange={handleInput}
            required
          />
          <Input
            label="Terminate URL *"
            name="terminateUrl"
            placeholder="http://www.website.com"
            onChange={handleInput}
            required
          />
          <Input
            label="Quotafull URL *"
            name="quotafullUrl"
            placeholder="http://www.website.com"
            onChange={handleInput}
            required
          />
          <Input
            label="Security Terminate URL *"
            name="securityTerminateUrl"
            placeholder="http://www.website.com"
            onChange={handleInput}
            required
          />
        </Section>

        {/* ===== SUBMIT ===== */}
        <div className="text-right pt-4">
          <button className="flex items-center gap-2 bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600">
            <FaSave /> Save Supplier
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-semibold mb-3 text-gray-700">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const TwoCol = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Input = ({ label, ...props }) => (
  <label className="block">
    <span className="text-sm font-medium">{label}</span>
    <input {...props} className="w-full border rounded p-2 mt-1" />
  </label>
);
