
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";

export default function CustomerEditModal({ customer, onClose, onUpdated }) {
  const [form, setForm] = useState({
    customerName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    website: "",
    taxNumber: "",
    notes: "",
  });

  const [contacts, setContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getCsrfToken = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    { withCredentials: true }
  );

  return response.data.csrfToken;
};

  /* ===============================
     1️⃣ Load All Countries Once
  =============================== */
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  /* ===============================
     2️⃣ Prefill When Editing
  =============================== */
  useEffect(() => {
    if (!customer) return;

    const selectedCountry = Country.getAllCountries().find(
      (c) => c.name === customer.country
    );

    let stateList = [];
    let cityList = [];

    if (selectedCountry) {
      stateList = State.getStatesOfCountry(selectedCountry.isoCode);

      const selectedState = stateList.find(
        (s) => s.name === customer.state
      );

      if (selectedState) {
        cityList = City.getCitiesOfState(
          selectedCountry.isoCode,
          selectedState.isoCode
        );
      }
    }

    setForm({
      customerName: customer.customerName || "",
      address1: customer.address1 || "",
      address2: customer.address2 || "",
      city: customer.city || "",
      state: customer.state || "",
      country: customer.country || "",
      zipCode: customer.zipCode || "",
      website: customer.website || "",
      taxNumber: customer.taxNumber || "",
      notes: customer.notes || "",
    });

    setStates(stateList);
    setCities(cityList);
    setContacts(customer.contacts || []);

  }, [customer]);

  /* ===============================
     3️⃣ Handle Change
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      let updatedForm = { ...prev, [name]: value };

      // When Country Changes
      if (name === "country") {
        const selectedCountry = countries.find(
          (c) => c.name === value
        );

        if (selectedCountry) {
          const stateList = State.getStatesOfCountry(
            selectedCountry.isoCode
          );
          setStates(stateList);
        } else {
          setStates([]);
        }

        updatedForm.state = "";
        updatedForm.city = "";
        setCities([]);
      }

      // When State Changes
      if (name === "state") {
        const selectedCountry = countries.find(
          (c) => c.name === prev.country
        );

        const selectedState = states.find(
          (s) => s.name === value
        );

        if (selectedCountry && selectedState) {
          const cityList = City.getCitiesOfState(
            selectedCountry.isoCode,
            selectedState.isoCode
          );
          setCities(cityList);
        } else {
          setCities([]);
        }

        updatedForm.city = "";
      }

      return updatedForm;
    });
  };

  /* ===============================
     4️⃣ Contact Handlers
  =============================== */
  const handleContactChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleAddContact = () => {
    setContacts([...contacts, { name: "", email: "", phone: "" }]);
  };

  const handleRemoveContact = (index) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
  };

  /* ===============================
     5️⃣ Update Customer
  =============================== */
  // const handleUpdate = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) throw new Error("Admin not logged in");

  //     await axios.put(
  //       `${BASE_URL}/api/admin/customers/${customer._id}`,
  //       { ...form, contacts },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     alert("Customer updated successfully!");
  //     onUpdated && onUpdated();
  //     onClose();

  //   } catch (error) {
  //     alert(error.response?.data?.message || error.message);
  //   }
  // };

  
const handleUpdate = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Admin not logged in");
    }

    const csrfToken = await getCsrfToken();

    await axios.put(
      `${BASE_URL}/api/admin/customers/${customer._id}`,
      { ...form, contacts },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    alert("Customer updated successfully!");

    if (onUpdated) await onUpdated();
    onClose();
  } catch (error) {
    console.error(
      "Update customer error:",
      error.response?.status,
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      error.response?.data?.msg ||
      error.message
    );
  }
};

  /* ===============================
     6️⃣ Delete Customer
  =============================== */
  // const handleDelete = async () => {
  //   if (!window.confirm("Are you sure you want to delete this customer?")) return;

  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) throw new Error("Admin not logged in");

  //     await axios.delete(
  //       `${BASE_URL}/api/admin/customers/${customer._id}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     alert("Customer deleted successfully!");
  //     onUpdated && onUpdated();
  //     onClose();

  //   } catch (error) {
  //     alert(error.response?.data?.message || error.message);
  //   }
  // };

  
const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this customer?")) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Admin not logged in");
    }

    const csrfToken = await getCsrfToken();

    await axios.delete(
      `${BASE_URL}/api/admin/customers/${customer._id}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    alert("Customer deleted successfully!");

    if (onUpdated) await onUpdated();
    onClose();
  } catch (error) {
    console.error(
      "Delete customer error:",
      error.response?.status,
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      error.response?.data?.msg ||
      error.message
    );
  }
};

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">

        <h2 className="text-xl font-bold mb-4">Edit Customer</h2>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold text-gray-600"
        >
          ×
        </button>

        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium">Website</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Tax */}
          <div>
            <label className="block text-sm font-medium">TAX / VAT Number</label>
            <input
              type="text"
              name="taxNumber"
              value={form.taxNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium">Address 1</label>
            <input
              type="text"
              name="address1"
              value={form.address1}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address 2</label>
            <input
              type="text"
              name="address2"
              value={form.address2}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium">Country</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium">State</label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              disabled={!form.country}
              className="w-full p-2 border rounded"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium">City</label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={!form.state}
              className="w-full p-2 border rounded"
            >
              <option value="">Select City</option>
              {cities.map((c, index) => (
                <option key={`${c.name}-${index}`} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Zip */}
          <div>
            <label className="block text-sm font-medium">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Contacts */}
          <div className="col-span-2 mt-4">
            <h3 className="font-semibold mb-2">Contacts</h3>

            {contacts.map((ct, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={ct.name}
                  onChange={(e) => handleContactChange(i, "name", e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={ct.email}
                  onChange={(e) => handleContactChange(i, "email", e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={ct.phone}
                  onChange={(e) => handleContactChange(i, "phone", e.target.value)}
                  className="p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveContact(i)}
                  className="bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddContact}
              className="bg-green-500 text-white px-3 py-1 rounded mt-2"
            >
              + Add Contact
            </button>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Customer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
