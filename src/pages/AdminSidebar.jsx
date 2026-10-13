/* eslint-disable no-unused-vars */
import {
  FaHome,
  FaQuestionCircle,
  FaProjectDiagram,
  FaDownload,
  FaTruck,
  FaUsers,
  FaUserPlus,
} from "react-icons/fa";

/* ---------- Helper Components ---------- */

function SidebarGroup({ icon, title, children, openMenu, setOpenMenu }) {
  const isOpen = openMenu === title;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpenMenu(isOpen ? null : title)}
        className={`flex items-center gap-3 w-full px-3 py-2 rounded
          ${isOpen ? "bg-gray-800" : "hover:bg-gray-800"}`}
      >
        {icon}
        <span className="font-medium">{title}</span>
      </button>

      {isOpen && <div className="ml-8 mt-1 space-y-1">{children}</div>}
    </div>
  );
}

function SidebarItem({ label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-3 py-1 text-sm rounded
        ${
          active
            ? "bg-teal-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`}
    >
      {label}
    </button>
  );
}

/* ---------- Main Sidebar ---------- */

export default function AdminSidebar({
  activePage,
  setActivePage,
  openMenu,
  setOpenMenu,
}) {
  return (
    <aside className="w-72 bg-gray-900 text-white min-h-screen p-4">

      {/* Home */}
      <SidebarGroup icon={<FaHome />} title="Home" openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <SidebarItem label="Dashboard" active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
        <SidebarItem label="Admin Dashboard" active={activePage === "adminDashboardData"} onClick={() => setActivePage("adminDashboardData")} />
      </SidebarGroup>

     

      {/* Project */}
      <SidebarGroup icon={<FaProjectDiagram />} title="Project" openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <SidebarItem label="Project List" active={activePage === "projectList"} onClick={() => setActivePage("projectList")} />
        <SidebarItem label="Create Project" active={activePage === "createProject"} onClick={() => setActivePage("createProject")} />
        <SidebarItem label="Assign Project" active={activePage === "assignProject"} onClick={() => setActivePage("assignProject")} />
      </SidebarGroup>

      {/* Data Download */}
      <SidebarGroup icon={<FaDownload />} title="Data Download" openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <SidebarItem label="Reports" active={activePage === "reports"} onClick={() => setActivePage("reports")} />
        <SidebarItem label="Exports" active={activePage === "exports"} onClick={() => setActivePage("exports")} />
      </SidebarGroup>

      {/* Supply Source */}
      <SidebarGroup icon={<FaTruck />} title="Supply Source" openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <SidebarItem label="Supplier List" active={activePage === "supplierList"} onClick={() => setActivePage("supplierList")} />
        <SidebarItem label="Add Supplier" active={activePage === "addSupplier"} onClick={() => setActivePage("addSupplier")} />
      </SidebarGroup>

      {/* Customer */}
      <SidebarGroup icon={<FaUsers />} title="Customer" openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <SidebarItem label="Customer List" active={activePage === "customerList"} onClick={() => setActivePage("customerList")} />
        <SidebarItem label="Add Customer" active={activePage === "addCustomer"} onClick={() => setActivePage("addCustomer")} />
      </SidebarGroup>

      {/* User */}
      <SidebarGroup icon={<FaUserPlus />} title="Employee" openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <SidebarItem label="Employee Detail" active={activePage === "userDetail"} onClick={() => setActivePage("userDetail")} />
        <SidebarItem label="Employee Registration" active={activePage === "newUser"} onClick={() => setActivePage("newUser")} />
      </SidebarGroup>

    </aside>
  );
}
