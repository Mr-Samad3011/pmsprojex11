/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaSave } from "react-icons/fa";

export default function UpdateSupplierModal({
  supplier,
  token,
  onClose,
  onUpdate,
}) {
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

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  /* ===== LOAD SUPPLIER DATA ===== */
  useEffect(() => {
    if (supplier) {
      setForm({
        supplierName: supplier.supplierName || "",
        address1: supplier.address1 || "",
        address2: supplier.address2 || "",
        city: supplier.city || "",
        state: supplier.state || "",
        country: supplier.country || "India",
        zip: supplier.zip || "",
        completeUrl: supplier.completeUrl || "",
        terminateUrl: supplier.terminateUrl || "",
        quotafullUrl: supplier.quotafullUrl || "",
        securityTerminateUrl: supplier.securityTerminateUrl || "",
      });
    }
  }, [supplier]);

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ===== UPDATE ===== */
 
/* ===== FETCH CSRF TOKEN ===== */
const getCsrfToken = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    {
      withCredentials: true,
    }
  );

  return response.data.csrfToken;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (!token) {
      throw new Error("Admin not logged in");
    }

    const csrfToken = await getCsrfToken();

    await axios.put(
      `${BASE_URL}/api/admin/suppliers/${supplier._id}`,
      form,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    alert("Supplier updated successfully");

    await onUpdate();
    onClose();
  } catch (err) {
    console.error(
      "UPDATE SUPPLIER ERROR:",
      err.response?.status,
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.message ||
      "Failed to update supplier"
    );
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Update Supplier</h2>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <Section title="Supplier Information">
            <Input
              label="Supplier Name *"
              name="supplierName"
              value={form.supplierName}
              onChange={handleInput}
              required
            />
          </Section>

          {/* ADDRESS */}
          <Section title="Address Details">
            <Input label="Address Line 1" name="address1" value={form.address1} onChange={handleInput} />
            <Input label="Address Line 2" name="address2" value={form.address2} onChange={handleInput} />

            <TwoCol>
              <Input label="City" name="city" value={form.city} onChange={handleInput} />
              <Input label="State" name="state" value={form.state} onChange={handleInput} />
            </TwoCol>

            <TwoCol>
              <Input label="Zip" name="zip" value={form.zip} onChange={handleInput} />
              <Input label="Country" name="country" value={form.country} disabled />
            </TwoCol>
          </Section>

          {/* URLS */}
          <Section title="Redirect URLs">
            <Input label="Complete URL" name="completeUrl" value={form.completeUrl} onChange={handleInput} />
            <Input label="Terminate URL" name="terminateUrl" value={form.terminateUrl} onChange={handleInput} />
            <Input label="Quotafull URL" name="quotafullUrl" value={form.quotafullUrl} onChange={handleInput} />
            <Input label="Security Terminate URL" name="securityTerminateUrl" value={form.securityTerminateUrl} onChange={handleInput} />
          </Section>

          {/* SUBMIT */}
          <div className="text-right pt-4">
            <button className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700">
              <FaSave /> Update Supplier
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ===== REUSABLE UI ===== */

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
    <input
      {...props}
      className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-teal-500"
    />
  </label>
);
