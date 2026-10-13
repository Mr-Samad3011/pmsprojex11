// // pages/Logout.jsx
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Logout() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // ✅ Clear token & user info
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     // ✅ Redirect to login
//     navigate("/", { replace: true });
//   }, [navigate]);

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <p className="text-lg text-gray-700">Logging out...</p>
//     </div>
//   );
// }


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Logout() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // 🔥 IMPORTANT
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // 🍪 Call backend to clear cookie
        await axios.post(`${BASE_URL}/api/logout`, {}, {
          withCredentials: true
        });
      } catch (err) {
        console.error("Logout error:", err);
      }

      // 🧹 Clear frontend data (optional)
      localStorage.removeItem("user");

      // 🔄 Redirect
      navigate("/", { replace: true });
    };

    logoutUser();
  }, [navigate, BASE_URL]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Logging out...</p>
    </div>
  );
}