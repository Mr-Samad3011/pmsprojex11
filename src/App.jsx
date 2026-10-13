// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./Employee/EmployeeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Logout from "./pages/Logout";
import ProjectDashboard from "./projectcomponent/ProjectDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedDepartments={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedDepartments={["Employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Project Dashboard (Admin only) */}
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute allowedDepartments={["Admin"]}>
              <ProjectDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;