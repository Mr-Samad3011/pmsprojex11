/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center bg-slate-800 text-white px-6 py-4">
      
      {/* LEFT: Menu + Dashboard Title */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="hover:text-teal-400">
          <Menu size={22} />
        </button>

        <h1 className="text-xl font-semibold">
          {user?.role === "admin" ? "Admin Dashboard" : "Employee Dashboard"}
        </h1>
      </div>

      {/* RIGHT: Profile */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3"
        >
          <UserCircle size={32} />
          <span className="text-sm capitalize">{user?.name}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-44 bg-white text-black rounded shadow z-50">
            <div className="px-4 py-2 border-b bg-gray-50 text-sm">
              <p className="font-semibold capitalize">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
              Profile
            </button>

            <button
              onClick={() => navigate("/logout")}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
