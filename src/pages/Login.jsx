
// // import { useState } from "react";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";

// // export default function Login() {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const BASE_URL = import.meta.env.VITE_BACKEND_URL;
// //   const navigate = useNavigate();

// //   const loginHandler = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const res = await axios.post(
// //         `${BASE_URL}/api/login`,
// //         { email, password }
// //       );

// //       const user = res.data.user;

// //       console.log("LOGIN RESPONSE:", res.data);

// //       // -------------------- Save to localStorage --------------------
// //       localStorage.setItem("token", res.data.token);
// //       localStorage.setItem("user", JSON.stringify(user));

// //       // Ensure departments is always an array
// //       const departments = Array.isArray(user.departments)
// //         ? user.departments
// //         : [user.departments];
// //       localStorage.setItem("departments", JSON.stringify(departments));

// //       // -------------------- Redirect Based on Department --------------------
// //       if (departments.includes("Admin")) {
// //         navigate("/admin"); // Admin dashboard
// //       } else if (departments.includes("Employee")) {
// //         navigate("/employee"); // Employee dashboard
// //       } else {
// //         // Fallback: no recognized department
// //         alert("You do not have access to any dashboard.");
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       alert("Invalid email or password");
// //     }
// //   };

// //   return (
// //     <form
// //       onSubmit={loginHandler}
// //       className="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded"
// //     >
// //       <h2 className="text-xl font-semibold mb-4">Login</h2>

// //       <input
// //         type="email"
// //         placeholder="Email"
// //         className="w-full border p-2 mb-3"
// //         onChange={(e) => setEmail(e.target.value)}
// //         required
// //       />

// //       <input
// //         type="password"
// //         placeholder="Password"
// //         className="w-full border p-2 mb-4"
// //         onChange={(e) => setPassword(e.target.value)}
// //         required
// //       />

// //       <button className="w-full bg-teal-500 text-white py-2 rounded">
// //         Login
// //       </button>
// //     </form>
// //   );
// // }



// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const BASE_URL = import.meta.env.VITE_BACKEND_URL;
//   const navigate = useNavigate();

//   // ✅ Always allow cookies
//   axios.defaults.withCredentials = true;

//   const loginHandler = async (e) => {
//     e.preventDefault();

//     try {
//       // ✅ STEP 1: Get CSRF Token
//       const csrfRes = await axios.get(`${BASE_URL}/api/csrf-token`, {
//         withCredentials: true,
//       });

//       const csrfToken = csrfRes.data.csrfToken;

//       // ✅ STEP 2: Send login request with CSRF token
//       const res = await axios.post(
//         `${BASE_URL}/api/login`,
//         { email, password },
//         {
//           withCredentials: true,
//           headers: {
//             "X-CSRF-Token": csrfToken,
//           },
//         }
//       );

//       const user = res.data.user;

//       console.log("LOGIN RESPONSE:", res.data);

//       // ✅ Store only safe data
//       localStorage.setItem("user", JSON.stringify(user));

//       const departments = Array.isArray(user.departments)
//         ? user.departments
//         : [user.departments];

//       // ✅ Redirect
//       if (departments.includes("Admin")) {
//         navigate("/admin");
//       } else if (departments.includes("Employee")) {
//         navigate("/employee");
//       } else {
//         alert("No dashboard access");
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
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         className="w-full border p-2 mb-4"
//         value={password}
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
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();

    if (!BASE_URL) {
      console.error("VITE_BACKEND_URL is not configured.");
      alert("Server configuration error. Please try again later.");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Get CSRF token
      const csrfRes = await axios.get(
        `${BASE_URL}/api/csrf-token`,
        {
          withCredentials: true,
        }
      );

      const csrfToken = csrfRes.data?.csrfToken;

      if (!csrfToken) {
        throw new Error("CSRF token was not received.");
      }

      // STEP 2: Login request
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

      console.log("LOGIN RESPONSE:", res.data);

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Login response is missing token or user.");
      }

      // STEP 3: Save authentication data
      const departments = Array.isArray(user.departments)
        ? user.departments
        : user.departments
          ? [user.departments]
          : [];

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem(
        "departments",
        JSON.stringify(departments)
      );

      console.log("Token saved:", !!localStorage.getItem("token"));
      console.log("User departments:", departments);

      // STEP 4: Redirect based on department
      const normalizedDepartments = departments.map((department) =>
        String(department).trim().toLowerCase()
      );

      if (normalizedDepartments.includes("admin")) {
        navigate("/admin", { replace: true });
      } else if (normalizedDepartments.includes("employee")) {
        navigate("/employee", { replace: true });
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("departments");

        alert("You do not have access to any dashboard.");
      }
    } catch (err) {
      console.error(
        "Login Error:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
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
        autoComplete="username"
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-500 text-white py-2 rounded disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
