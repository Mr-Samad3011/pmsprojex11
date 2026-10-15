import { useEffect, useState } from "react";
import axios from "axios";

export default function SurveyLinksModal({ groupId, onClose }) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  if (!groupId) {
    setLoading(false);
    setError("Group ID is missing.");
    return;
  }

  const fetchSurvey = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/api/surveys/group/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSurvey(res.data?.survey ?? res.data ?? null);
    } catch (err) {
      console.error("Failed to fetch survey:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      setSurvey(null);

      if (err.response?.status === 404) {
        setError(
          "Survey endpoint ya is group ka survey record nahi mila. Backend route aur saved survey data check karein."
        );
      } else {
        setError("Survey links load nahi ho sake. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchSurvey();
}, [groupId, BASE_URL, token]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-xl rounded-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Survey Links</h2>
          <button
            onClick={onClose}
            className="text-red-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {survey ? (
          <div className="space-y-4">

            {/* LIVE URL */}
            <div>
              <label className="text-xs font-semibold text-gray-500">
                Live URL
              </label>
              <div className="border rounded px-3 py-2 bg-gray-100 text-sm break-all">
                {survey.liveUrl || "-"}
              </div>
            </div>

            {/* TEST URL */}
            <div>
              <label className="text-xs font-semibold text-gray-500">
                Test URL
              </label>
              <div className="border rounded px-3 py-2 bg-gray-100 text-sm break-all">
                {survey.testUrl || "-"}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-gray-500">
            No survey links found
          </div>
        )}
      </div>
    </div>
  );
}
