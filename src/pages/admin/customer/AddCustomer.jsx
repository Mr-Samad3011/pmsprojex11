import { useState, useEffect } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";

export default function AddCustomer({ fetchCustomers }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  
const getCsrfToken = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    { withCredentials: true }
  );

  return response.data.csrfToken;
};

  const [form, setForm] = useState({
    customerName: "",
    website: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    taxNumber: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Load Countries
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Load States
  useEffect(() => {
    if (form.country) {
      const selectedCountry = countries.find(
        (c) => c.name === form.country
      );
      if (selectedCountry) {
        setStates(State.getStatesOfCountry(selectedCountry.isoCode));
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [form.country]);

  // Load Cities
  useEffect(() => {
    if (form.state) {
      const selectedCountry = countries.find(
        (c) => c.name === form.country
      );
      const selectedState = states.find(
        (s) => s.name === form.state
      );

      if (selectedCountry && selectedState) {
        setCities(
          City.getCitiesOfState(
            selectedCountry.isoCode,
            selectedState.isoCode
          )
        );
      }
    } else {
      setCities([]);
    }
  }, [form.state]);

  const validate = () => {
    let newErrors = {};

    if (!form.customerName.trim())
      newErrors.customerName = "Customer name is required";

    if (!form.website.trim())
      newErrors.website = "Website is required";
    else if (
      !/^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/.test(form.website)
    )
      newErrors.website = "Enter valid website URL";

    if (!form.country) newErrors.country = "Country is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.city) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    
try {
  setLoading(true);

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Admin not logged in");
  }

  // Get CSRF token before POST request
  const csrfToken = await getCsrfToken();

  await axios.post(
    `${BASE_URL}/api/admin/customers`,
    form,
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-Token": csrfToken,
      },
    }
  );

  alert("Customer added successfully!");

  if (fetchCustomers) {
    await fetchCustomers();
  }

  setForm({
    customerName: "",
    website: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    taxNumber: "",
    notes: "",
  });

  setErrors({});
} catch (error) {
  console.error(
    "Add Customer Error:",
    error.response?.status,
    error.response?.data || error.message
  );

  alert(
    error.response?.data?.message ||
    error.response?.data?.msg ||
    error.message ||
    "Error adding customer"
  );
} finally {
  setLoading(false);
}

  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Add Customer
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Customer Name */}
        <div>
          <label className="font-medium">Customer Name *</label>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm">{errors.customerName}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="font-medium">Website *</label>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full p-2 border rounded mt-1"
          />
          {errors.website && (
            <p className="text-red-500 text-sm">{errors.website}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="font-medium">Country *</label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm">{errors.country}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="font-medium">State *</label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-sm">{errors.state}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="font-medium">City *</label>
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="">Select City</option>
            {cities.map((c, index) => (
              <option key={index} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="text-red-500 text-sm">{errors.city}</p>
          )}
        </div>

        {/* Zip Code */}
        <div>
          <label className="font-medium">Zip Code</label>
          <input
            type="text"
            name="zipCode"
            value={form.zipCode}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        {/* Tax */}
        <div>
          <label className="font-medium">Tax / VAT Number</label>
          <input
            type="text"
            name="taxNumber"
            value={form.taxNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

       {/* Address Line 1 */}
<div>
  <label className="font-medium">Address Line 1</label>
  <input
    type="text"
    name="address1"
    value={form.address1}
    onChange={handleChange}
    className="w-full p-2 border rounded mt-1"
  />
</div>

{/* Address Line 2 */}
<div>
  <label className="font-medium">Address Line 2</label>
  <input
    type="text"
    name="address2"
    value={form.address2}
    onChange={handleChange}
    className="w-full p-2 border rounded mt-1"
  />
</div>


        {/* Notes */}
        <div className="md:col-span-2">
          <label className="font-medium">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`md:col-span-2 py-3 rounded text-white font-medium transition ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}



