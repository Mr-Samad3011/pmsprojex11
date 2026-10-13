import { useState, useEffect } from "react";
import axios from "axios";

export default function ProjectSpecificationModal({ groupId, onClose, onLaunchSuccess }) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
 
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
    return {};
  }
};

const user = getStoredUser();

const empId = user?.userId;
const empMongoId = user?.id || user?._id;
 // 🔥 important fix
  

  /* ================= FETCH GROUP DATA ================= */
  // useEffect(() => {
  //   if (!groupId) return;

  //   const fetchGroup = async () => {
  //     try {
  //       const res = await axios.get(
  //         `${BASE_URL}/api/groups/${groupId}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       setGroup(res.data);
  //     } catch (err) {
  //       console.error("Failed to fetch group:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchGroup();
  // }, [groupId]);


/* ================= CSRF HELPER ================= */

/* ================= CSRF HELPER ================= */
const getCsrfConfig = async () => {
  const csrfRes = await axios.get(
    `${BASE_URL}/api/csrf-token`,
    {
      withCredentials: true,
    }
  );

  const csrfToken = csrfRes.data?.csrfToken;

  if (!csrfToken) {
    throw new Error("CSRF token not received from server");
  }

  return {
    withCredentials: true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-CSRF-Token": csrfToken,
    },
  };
};


/* ================= FETCH GROUP FUNCTION ================= */
  const fetchGroup = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/groups/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroup(res.data);
    } catch (err) {
      console.error("Failed to fetch group:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!groupId) return;
    fetchGroup();
  }, [groupId]);

 /* ================= CHECK ALREADY LAUNCHED ================= */
  const alreadyLaunched = group?.launchedBy?.some((l) => {
    const backendId =
      typeof l.employee === "object"
        ? l.employee?._id
        : l.employee;

    return backendId?.toString() === empMongoId?.toString();
  });

   /* ================= ACTION HANDLERS ================= */

   /* ================= LAUNCH ================= */

const handleLaunch = async () => {
  if (alreadyLaunched) {
    alert("Project already launched");
    return;
  }

  try {
    setLaunching(true);

    const config = await getCsrfConfig();

    const res = await axios.put(
      `${BASE_URL}/api/groups/launch/${groupId}`,
      {},
      config
    );

    alert(res.data.message || "Project Launched Successfully");

    if (onLaunchSuccess) {
      await onLaunchSuccess();
    }

    await fetchGroup();
  } catch (err) {
    console.error(
      "Launch Error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Launch Failed"
    );
  } finally {
    setLaunching(false);
  }
};


  /* ================= REJECT ================= */

const handleReject = async () => {
  try {
    const config = await getCsrfConfig();

    await axios.put(
      `${BASE_URL}/api/groups/reject/${groupId}`,
      {},
      config
    );

    alert("Project Rejected");

    if (onLaunchSuccess) {
      await onLaunchSuccess();
    }

    onClose();
  } catch (err) {
    console.error(
      "Reject Error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Reject Failed"
    );
  }
};

  /* ================= FIELD COMPONENT ================= */
  const Field = ({ label, value }) => (
    <div>
      <label className="text-xs font-semibold text-gray-500">
        {label}
      </label>
      <div className="border rounded px-3 py-2 bg-gray-100 text-sm">
        {value ?? "-"}
      </div>
    </div>
  );

  /* ================= TEXTAREA COMPONENT ================= */
  const TextAreaField = ({ label, value }) => (
    <div className="md:col-span-2">
      <label className="text-xs font-semibold text-gray-500">
        {label}
      </label>
      <textarea
        value={value || ""}
        readOnly
        rows={6}
        className="w-full border rounded px-3 py-2 bg-gray-100 text-sm resize-none"
      />
    </div>
  );

  /* ================= ACTION HANDLERS ================= */

  // const handleLaunch = async () => {
  //   try {
  //     await axios.put(
  //       `${BASE_URL}/api/groups/launch/${groupId}`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     alert("Project Launched Successfully");
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Launch Failed");
  //   }
  // };

  // const handleReject = async () => {
  //   try {
  //     await axios.put(
  //       `${BASE_URL}/api/groups/reject/${groupId}`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     alert("Project Rejected");
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Reject Failed");
  //   }
  // };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded">Loading...</div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg p-6">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">
            Project Specification – {group.projectId?.projectName}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* ================= DETAIL PAGE ================= */}
        <h3 className="font-semibold text-lg mb-3">Detail Page</h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Field label="Country" value={group.bidSpecs?.country} />
          <Field label="Language" value={group.bidSpecs?.language} />
          <Field label="Incidence %" value={group.bidSpecs?.incidence} />
          <Field label="LOI (min)" value={group.bidSpecs?.loi} />
          <Field label="CPI" value={group.bidSpecs?.cpi} />
          

          <Field
            label="Start Date"
            value={
              group.bidSpecs?.startDate
                ? new Date(group.bidSpecs.startDate).toLocaleDateString()
                : "-"
            }
          />

          <Field
            label="End Date"
            value={
              group.bidSpecs?.endDate
                ? new Date(group.bidSpecs.endDate).toLocaleDateString()
                : "-"
            }
          />
        </div>

        {/* ================= QUOTA DETAIL ================= */}
        <h3 className="font-semibold text-lg mb-3">Quota Detail</h3>

        <div className="border rounded-lg p-4 bg-gray-50 mb-6">
          <TextAreaField
            label="Quota Description"
            value={group.bidSpecs?.quotaDetail}
          />
        </div>

        {/* ================= EMPLOYEE MANAGEMENT ================= */}
        <h3 className="font-semibold text-lg mb-3">Employee Management</h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Employee CPI */}
          <div className="border rounded-lg p-5 bg-gray-50 shadow-sm">
            <h4 className="font-semibold text-md mb-4 text-gray-700">
              Employee CPI
            </h4>

            <div className="grid grid-cols-2 gap-6 mb-2">
              <label className="text-xs font-semibold text-gray-500">
                Employee Code
              </label>
              <label className="text-xs font-semibold text-gray-500">
                CPI
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border rounded px-3 py-2 bg-white text-sm font-medium">
               {empId ?? "-"}
              </div>

              <div className="border rounded px-3 py-2 bg-white text-sm">
                {group.bidSpecs?.cpi ?? "-"}
              </div>
            </div>
          </div>

          {/* Employee Quota */}
          <div className="border rounded-lg p-5 bg-gray-50 shadow-sm">
            <h4 className="font-semibold text-md mb-4 text-gray-700">
              Employee Quota
            </h4>

            <div className="grid grid-cols-2 gap-6 mb-2">
              <label className="text-xs font-semibold text-gray-500">
                Employee Code
              </label>
              <label className="text-xs font-semibold text-gray-500">
                Quota (Completes)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border rounded px-3 py-2 bg-white text-sm font-medium">
               {empId ?? "-"}
              </div>

              <div className="border rounded px-3 py-2 bg-white text-sm">
                {group.bidSpecs?.completes ?? "-"}
              </div>
            </div>
          </div>

        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reject Project
          </button>

         <button
            onClick={handleLaunch}
            disabled={alreadyLaunched || launching}
            className={`px-6 py-2 rounded text-white ${
              alreadyLaunched
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {alreadyLaunched
              ? "Already Launched"
              : launching
              ? "Launching..."
              : "Launch Project"}
          </button>
        </div>

      </div>
    </div>
  );
}