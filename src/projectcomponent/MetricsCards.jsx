import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaPause, FaPlay, FaCheck } from "react-icons/fa";
import SurveyUrlsModal from "./SurveyUrlsModal";

export default function MetricsCards({
  stats = {},
  group,
  onStatusUpdated,
}) {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(group?.status);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  /* ================= SYNC GROUP STATUS ================= */
  useEffect(() => {
    setLocalStatus(group?.status);
  }, [group?.status]);

  /* ================= DERIVED STATES ================= */
  const isProjectPaused = useMemo(() => {
    return group?.projectId?.status === "Paused";
  }, [group?.projectId?.status]);

  const isCompleted = localStatus === "Completed";

  /* ================= STATUS TOGGLE ================= */
  // const handleGroupStatusToggle = async () => {
  //   if (!group || statusLoading) return;

  //   if (isCompleted) {
  //     alert("⚠ Completed group status cannot be changed.");
  //     return;
  //   }

  //   try {
  //     setStatusLoading(true);

  //     const newStatus =
  //       localStatus === "Live" ? "Paused" : "Live";

  //     const res = await axios.patch(
  //       `${BASE_URL}/api/groups/${group._id}/status`,
  //       { status: newStatus },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     const updatedGroup = res.data.group;

  //     // ✅ Trust backend only
  //     setLocalStatus(updatedGroup.status);

  //     if (onStatusUpdated) {
  //       onStatusUpdated(updatedGroup.status);
  //     }

  //   } catch (err) {
  //     if (err.response?.data?.msg) {
  //       alert(err.response.data.msg);
  //     } else {
  //       alert("Failed to update group status.");
  //     }
  //   } finally {
  //     setStatusLoading(false);
  //   }
  // };

  
/* ================= STATUS TOGGLE WITH CSRF ================= */
const handleGroupStatusToggle = async () => {
  if (!group || statusLoading) return;

  if (isCompleted) {
    alert("⚠ Completed group status cannot be changed.");
    return;
  }

  if (isProjectPaused) {
    alert("Project is paused. Please make project Live first.");
    return;
  }

  try {
    setStatusLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Session expired. Please log in again.");
    }

    // Step 1: Get CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const csrfToken = csrfResponse.data?.csrfToken;

    if (!csrfToken) {
      throw new Error("CSRF token was not received from server.");
    }

    // Step 2: Toggle group status
    const newStatus = localStatus === "Live" ? "Paused" : "Live";

    const res = await axios.patch(
      `${BASE_URL}/api/groups/${group._id}/status`,
      { status: newStatus },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    const updatedGroup = res.data.group;

    // Update UI using backend response
    setLocalStatus(updatedGroup.status);

    if (onStatusUpdated) {
      onStatusUpdated(updatedGroup.status);
    }
  } catch (err) {
    console.error(
      "Group status update error:",
      err.response?.data || err
    );

    const message =
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Failed to update group status.";

    alert(message);
  } finally {
    setStatusLoading(false);
  }
};

  /* ================= STATUS UI ================= */
  const renderStatusIcon = () => {
    if (localStatus === "Live") return <FaPause size={16} />;
    if (localStatus === "Paused") return <FaPlay size={16} />;
    return <FaCheck size={16} />;
  };

  const getStatusColor = () => {
    if (isProjectPaused) return "bg-gray-400 cursor-not-allowed";
    if (localStatus === "Live")
      return "bg-green-500 hover:bg-green-600";
    if (localStatus === "Paused")
      return "bg-yellow-500 hover:bg-yellow-600";
    return "bg-gray-500";
  };

  /* ================= CARDS DATA ================= */
  const cardsTop = [
    { label: "Median LOI (Min)", value: stats.medianLoi ?? "0.0", bg: "bg-emerald-500" },
    { label: "Incidence (%)", value: stats.incidence ?? 0, bg: "bg-lime-500" },
    { label: "Total Visits", value: stats.visits ?? 0, bg: "bg-red-500" },
    { label: "Total Starts", value: stats.starts ?? 0, bg: "bg-sky-500" },
  ];

  const cardsMiddle = [
    { label: "Completes", value: stats.completes ?? 0, bg: "bg-purple-600" },
    { label: "Terminates", value: stats.terminates ?? 0, bg: "bg-pink-600" },
    { label: "Security Term", value: stats.securityTerm ?? 0, bg: "bg-orange-500" },
    { label: "Quota Full", value: stats.quotaFull ?? 0, bg: "bg-indigo-600" },
  ];

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center border">

        <div className="flex items-center gap-4">

          {/* 🔥 STATUS BUTTON */}
          <button
            onClick={handleGroupStatusToggle}
            disabled={statusLoading || isProjectPaused}
            className={`w-12 h-12 flex items-center justify-center rounded-lg text-white transition ${getStatusColor()} ${
              statusLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {statusLoading ? "..." : renderStatusIcon()}
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {group?.groupName}
            </h1>
            <p className="text-gray-600 text-sm">
              {group?.projectId?.projectName}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowSurveyModal(true)}
            className="bg-teal-500 hover:bg-teal-600 transition text-white px-5 py-2 rounded-lg font-medium shadow"
          >
            + Survey URL
          </button>
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsTop.map((card, i) => (
          <Card key={i} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsMiddle.map((card, i) => (
          <Card key={i} card={card} />
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {showSurveyModal && (
        <SurveyUrlsModal
          projectId={group?.projectId?._id}
          groupId={group?._id}
          existingData={group?.projectId}
          onClose={() => setShowSurveyModal(false)}
        />
      )}
    </div>
  );
}

/* ================= CARD ================= */
function Card({ card }) {
  return (
    <div className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <div className={`${card.bg} text-white text-center py-8`}>
        <h2 className="text-3xl font-bold">{card.value}</h2>
      </div>
      <div className="bg-gray-100 text-center py-3 font-medium text-gray-700">
        {card.label}
      </div>
    </div>
  );
}