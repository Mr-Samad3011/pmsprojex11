
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const BASE_URL = import.meta.env.VITE_BACKEND_URL;
//   const navigate = useNavigate();

//   const loginHandler = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post(
//         `${BASE_URL}/api/login`,
//         { email, password }
//       );

//       const user = res.data.user;

//       console.log("LOGIN RESPONSE:", res.data);

//       // -------------------- Save to localStorage --------------------
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(user));

//       // Ensure departments is always an array
//       const departments = Array.isArray(user.departments)
//         ? user.departments
//         : [user.departments];
//       localStorage.setItem("departments", JSON.stringify(departments));

//       // -------------------- Redirect Based on Department --------------------
//       if (departments.includes("Admin")) {
//         navigate("/admin"); // Admin dashboard
//       } else if (departments.includes("Employee")) {
//         navigate("/employee"); // Employee dashboard
//       } else {
//         // Fallback: no recognized department
//         alert("You do not have access to any dashboard.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Invalid email or password");
//     }
//   };

//   return (
//     <form
//       onSubmit={loginHandler}
//       className="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded"
//     >
//       <h2 className="text-xl font-semibold mb-4">Login</h2>

//       <input
//         type="email"
//         placeholder="Email"
//         className="w-full border p-2 mb-3"
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         className="w-full border p-2 mb-4"
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />

//       <button className="w-full bg-teal-500 text-white py-2 rounded">
//         Login
//       </button>
//     </form>
//   );
// }



import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // ✅ Always allow cookies
  axios.defaults.withCredentials = true;

  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      // ✅ STEP 1: Get CSRF Token
      const csrfRes = await axios.get(`${BASE_URL}/api/csrf-token`, {
        withCredentials: true,
      });

      const csrfToken = csrfRes.data.csrfToken;

      // ✅ STEP 2: Send login request with CSRF token
      const res = await axios.post(
        `${BASE_URL}/api/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

    
const user = res.data.user;

console.log("LOGIN RESPONSE:", res.data);

// Save token AND user
if (!res.data.token || !user) {
  alert("Login response is missing token or user data");
  return;
}

localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(user));

const departments = Array.isArray(user.departments)
  ? user.departments
  : user.departments
    ? [user.departments]
    : [];

console.log("Saved token:", !!localStorage.getItem("token"));
console.log("Departments:", departments);

// Redirect after saving authentication data
if (departments.some((dep) => dep?.toLowerCase() === "admin")) {
  navigate("/admin", { replace: true });
} else if (
  departments.some((dep) => dep?.toLowerCase() === "employee")
) {
  navigate("/employee", { replace: true });
} else {
  alert("No dashboard access for this department");
}

  };

  return (
    <form
      onSubmit={loginHandler}
      className="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded"
    >
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className="w-full bg-teal-500 text-white py-2 rounded">
        Login
      </button>
    </form>
  );
}
