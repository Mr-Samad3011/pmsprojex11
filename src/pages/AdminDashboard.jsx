// import { useState } from "react";
// import DashboardHeader from "../components/DashboardHeader";
// import AdminSidebar from "./AdminSidebar";
// import AddEmployee from "./AddEmployee";
// import CreateProject from "./admin/CreateProject";
// import ProjectList from "./admin/ProjectList";
// import EmployeeList from "./admin/EmployeeList";
// import AssignProject from "./admin/AssignProject";
// import AddSupplier from "./admin/supplier/AddSupplier";
// import SupplierList from "./admin/supplier/SupplierList";
// import AddCustomer from "./admin/customer/AddCustomer";
// import CustomerList from "./admin/customer/CustomerList";
// import ProjectDashboard from "../projectcomponent/ProjectDashboard";
// import GroupDashboard from "../pages/GroupDashboard";
// import Dashboard from "./admin/admin/Dashoboard"
// import AdminDashboardData from "./admin/admin/AdminDashboardData";

// export default function AdminDashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [activePage, setActivePage] = useState("dashboard");
//   const [openMenu, setOpenMenu] = useState(null);

//   // ✅ store selected IDs
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [selectedGroupId, setSelectedGroupId] = useState(null);

//   const renderContent = () => {
//     switch (activePage) {
//       case "newUser":
//         return <AddEmployee />;

//       case "createProject":
//         return <CreateProject setActivePage={setActivePage} />;

//       case "projectList":
//         return (
//           <ProjectList
//             setActivePage={setActivePage}
//             setSelectedProjectId={setSelectedProjectId}
//           />
//         );

//       case "projectDashboard":
//         return selectedProjectId ? (
//           <ProjectDashboard
//             projectId={selectedProjectId}
//             setActivePage={setActivePage}          // ✅ PASS THIS
//             setSelectedGroupId={setSelectedGroupId} // ✅ PASS THIS
//           />
//         ) : (
//           <p className="p-6 text-red-500">No project selected</p>
//         );

//      case "groupDashboard":
//   return selectedGroupId ? (
//     <GroupDashboard
//       groupId={selectedGroupId}
//       setActivePage={setActivePage}
//       setSelectedProjectId={setSelectedProjectId}   // ✅ ADD THIS
//     />
//   ) : (
//     <p className="p-6 text-red-500">No group selected</p>
//   );


//       case "userDetail":
//         return <EmployeeList />;

//       case "assignProject":
//         return <AssignProject />;

//       case "addCustomer":
//         return <AddCustomer />;

//       case "customerList":
//         return <CustomerList />;

//       case "supplierList":
//         return <SupplierList />;

//       case "addSupplier":
//         return <AddSupplier />;

//        case "dashboard":
//   return (
//     <Dashboard
//       onSelectProject={(project) => {
//         setSelectedProjectId(project._id); // store the selected project
//         setActivePage("projectDashboard"); // switch to project dashboard
//       }}
//     />
//   );

//   case "adminDashboardData":
//      return <AdminDashboardData/>


//       default:
//         return (
//           <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
//             <h1 className="text-3xl font-semibold mb-4">Welcome Admin</h1>
//             <p className="text-gray-700">
//               Select an option from the sidebar to manage users or projects.
//             </p>
//           </div>
//         );
//     }
//   };

//   return (
//     <>
//       <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

//       <div className="flex min-h-screen">
//         {sidebarOpen && (
//           <AdminSidebar
//             activePage={activePage}
//             setActivePage={setActivePage}
//             openMenu={openMenu}
//             setOpenMenu={setOpenMenu}
//           />
//         )}

//         <main className="flex-1 transition-all duration-300">
//           {renderContent()}
//         </main>
//       </div>
//     </>
//   );
// }

import { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import AdminSidebar from "./AdminSidebar";

// Admin Modules
import AddEmployee from "./AddEmployee";
import CreateProject from "./admin/CreateProject";
import ProjectList from "./admin/ProjectList";
import EmployeeList from "./admin/EmployeeList";
import AssignProject from "./admin/AssignProject";
import AddSupplier from "./admin/supplier/AddSupplier";
import SupplierList from "./admin/supplier/SupplierList";
import AddCustomer from "./admin/customer/AddCustomer";
import CustomerList from "./admin/customer/CustomerList";
import ProjectDashboard from "../projectcomponent/ProjectDashboard";
import GroupDashboard from "../pages/GroupDashboard";
import Dashboard from "./admin/admin/Dashoboard";
import AdminDashboardData from "./admin/admin/AdminDashboardData";


export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [openMenu, setOpenMenu] = useState(null);

  // Selected IDs for project/group
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // -------------------- Render Content --------------------
  const renderContent = () => {
    switch (activePage) {
      case "newUser":
        return <AddEmployee />;

      case "createProject":
        return <CreateProject setActivePage={setActivePage} />;

      case "projectList":
        return (
          <ProjectList
            setActivePage={setActivePage}
            setSelectedProjectId={setSelectedProjectId}
          />
        );

      case "projectDashboard":
        return selectedProjectId ? (
          <ProjectDashboard
            projectId={selectedProjectId}
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
          />
        ) : (
          <p className="p-6 text-red-500">No project selected</p>
        );

      case "groupDashboard":
        return selectedGroupId ? (
          <GroupDashboard
            groupId={selectedGroupId}
            setActivePage={setActivePage}
            setSelectedProjectId={setSelectedProjectId}
          />
        ) : (
          <p className="p-6 text-red-500">No group selected</p>
        );

      case "userDetail":
        return <EmployeeList />;

      case "assignProject":
        return <AssignProject />;

      case "addCustomer":
        return <AddCustomer />;

      case "customerList":
        return <CustomerList />;

      case "supplierList":
        return <SupplierList />;

      case "addSupplier":
        return <AddSupplier />;

      case "dashboard":
        return (
          <Dashboard
            onSelectProject={(project) => {
              setSelectedProjectId(project._id); // store the selected project
              setActivePage("projectDashboard"); // switch to project dashboard
            }}
          />
        );

      case "adminDashboardData":
        return <AdminDashboardData />;

      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-semibold mb-4">Welcome Admin</h1>
            <p className="text-gray-700">
              Select an option from the sidebar to manage users or projects.
            </p>
          </div>
        );
    }
  };

  return (
    <>
      {/* -------------------- Header -------------------- */}
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex min-h-screen">
        {/* -------------------- Sidebar -------------------- */}
        {sidebarOpen && (
          <AdminSidebar
            activePage={activePage}
            setActivePage={setActivePage}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
        )}

        {/* -------------------- Main Content -------------------- */}
        <main className="flex-1 transition-all duration-300">
          {renderContent()}
        </main>
      </div>
    </>
  );
}
