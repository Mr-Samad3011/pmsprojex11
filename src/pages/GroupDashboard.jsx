/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import axios from "../../backend/services/api";
import { io } from "socket.io-client";

import MetricsCards from "../projectcomponent/MetricsCards";
import BidSpecsPanel from "../projectcomponent/BidSpecsPanel";

// 🔌 socket singleton
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
});

export default function GroupDashboard({ 
  groupId, 
  setActivePage, 
  setSelectedProjectId 
})
{
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH GROUP =================
  const fetchGroup = async () => {
    try {
      setLoading(true);

     const res = await axios.get(`/api/groups/${groupId}`);

      console.log("Fetched Group:", res.data);

      setGroup(res.data);
    } catch (err) {
      console.error("Fetch group error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= USE EFFECT =================
  useEffect(() => {
    if (!groupId) return;

    fetchGroup();

    // 📡 Real-time stats update
    socket.on("statsUpdated", (updatedStats) => {
      setGroup((prev) =>
        prev ? { ...prev, stats: updatedStats } : prev
      );
    });

    return () => {
      socket.off("statsUpdated");
    };
  }, [groupId]);

  // ================= LOADING =================
  if (loading) {
    return <p className="p-6 text-gray-600">Loading Group Dashboard...</p>;
  }

  // ================= NO GROUP =================
  if (!group) {
    return (
      <p className="p-6 text-red-500 font-semibold">
        No group found
      </p>
    );
  }

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6 max-w-[1600px] mx-auto w-full">
      
      {/* HEADER */}
      <h1
  onClick={() => {
    setSelectedProjectId(group.projectId?._id);
    setActivePage("projectDashboard");
  }}
  className="text-2xl font-bold text-blue-600 cursor-pointer hover:underline"
>
  {group.projectId?.projectName}
</h1>


      {/* DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metrics */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
          <MetricsCards stats={group.stats} group={group}  onStatusUpdated={(newStatus) =>
    setGroup(prev => ({ ...prev, status: newStatus }))
  }/>
        </div>

        {/* Bid Specs */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
          <BidSpecsPanel
            groupId={group._id}              // ✅ important
            initialData={group}              // ✅ full group
            onSaveSuccess={(updatedGroup) => {
              setGroup(updatedGroup);        // ✅ parent update
            }}
          />
        </div>

      </div>
    </div>
  );
}
