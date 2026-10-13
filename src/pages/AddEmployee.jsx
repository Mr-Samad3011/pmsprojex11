import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function AddEmployee() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    contactNumber: "",
    dob: "",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const departmentOptions = ["Admin", "Employee"];
  
const getCsrfToken = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    { withCredentials: true }
  );

  return response.data.csrfToken;
};


  // 🔥 IMPORTANT
  axios.defaults.withCredentials = true;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      department,
      position,
      contactNumber,
      dob,
    } = form;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !department ||
      !position ||
      !contactNumber ||
      !dob
    ) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

   
try {
  // Get a fresh CSRF token before POST request
  const csrfToken = await getCsrfToken();

  const res = await axios.post(
    `${BASE_URL}/api/admin/create-employee`,
    {
      ...form,
      departments: [department],
    },
    {
      withCredentials: true,
      headers: {
        "X-CSRF-Token": csrfToken,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  alert("Employee Created | User ID: " + res.data.user.userId);

  setForm({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    contactNumber: "",
    dob: "",
    password: "",
    confirmPassword: "",
    department: "",
  });
} catch (err) {
  console.error(
    "Create Employee Error:",
    err.response?.status,
    err.response?.data || err.message
  );

  alert(
    err.response?.data?.message ||
    err.response?.data?.msg ||
    "Error creating employee"
  );
}

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl bg-white p-6 rounded shadow space-y-5"
    >
      <h2 className="text-xl font-semibold text-gray-700">
        New User Registration
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Position</label>
          <input name="position" value={form.position} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Contact Number</label>
          <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Date of Birth</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        {/* Password */}
        <div className="relative">
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded pr-10"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {/* Confirm */}
        <div className="relative">
          <label>Confirm Password</label>
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border p-2 rounded pr-10"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {/* Department */}
        <div className="md:col-span-2">
          <label>Department</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select</option>
            {departmentOptions.map((dep) => (
              <option key={dep}>{dep}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="w-full bg-teal-600 text-white py-2 rounded">
        Submit
      </button>
    </form>
  );
}