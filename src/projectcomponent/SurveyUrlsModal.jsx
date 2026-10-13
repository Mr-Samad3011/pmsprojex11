/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { FaDownload } from "react-icons/fa";

export default function SurveyUrlsModal({
  projectId,
  onClose,
  groupId,
}) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");

  const [urlType, setUrlType] = useState("Single");
  const [liveUrl, setLiveUrl] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [multipleUrls, setMultipleUrls] = useState([]);
  const [ipCheck, setIpCheck] = useState(true);
  const [projectIdCheck, setProjectIdCheck] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===================================================
     LOAD EXISTING SURVEY (ONE PER GROUP)
  =================================================== */
  useEffect(() => {
    if (!groupId) return;

    const fetchSurvey = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/admin/surveys/group/${groupId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data;

        setUrlType(data.type || "Single");
        setLiveUrl(data.liveUrl || "");
        setTestUrl(data.testUrl || "");
        setMultipleUrls(data.multipleUrls || []);
        setIpCheck(data.ipCheck ?? true);
        setProjectIdCheck(data.projectIdCheck ?? true);
        setExistingFileName(data.uploadedFileName || "");
      } catch (err) {
        // Agar survey exist nahi karta to ignore karo
        console.log("No existing survey");
      }
    };

    fetchSurvey();
  }, [groupId]);

  /* ===================================================
     TYPE CHANGE
  =================================================== */
  const handleTypeChange = (value) => {
    setUrlType(value);
    setError("");

    if (value === "Single") {
      setMultipleUrls([]);
      setUploadedFile(null);
    } else {
      setLiveUrl("");
      setTestUrl("");
    }
  };

  /* ===================================================
     FILE UPLOAD
  =================================================== */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = [
      "txt",
      "png",
      "jpeg",
      "jpg",
      "pdf",
      "xlsx",
      "xls",
      "csv",
    ];

    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setError("Only allowed file types accepted.");
      e.target.value = "";
      return;
    }

    setError("");
    setUploadedFile(file);
    setExistingFileName(file.name);

    if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const lines = event.target.result.split("\n");
        const cleaned = lines
          .map((url) => url.trim())
          .filter((url) => url !== "");
        setMultipleUrls(cleaned);
      };
      reader.readAsText(file);
    }
  };

  /* ===================================================
     SAVE (CREATE OR UPDATE)
  =================================================== */
  // const handleSave = async () => {
  //   setError("");

  //   if (!groupId) return setError("Group ID missing.");
  //   if (!projectId) return setError("Project ID missing.");

  //   if (urlType === "Single" && !liveUrl) {
  //     return setError("Live URL is required.");
  //   }

  //   if (urlType === "Multiple" && !uploadedFile && !existingFileName) {
  //     return setError("Please upload a file.");
  //   }

  //   try {
  //     setLoading(true);

  //     const formData = new FormData();
  //     formData.append("groupId", groupId);
  //     formData.append("projectId", projectId);
  //     formData.append("type", urlType);
  //     formData.append("liveUrl", liveUrl || "");
  //     formData.append("testUrl", testUrl || "");
  //     formData.append("ipCheck", String(ipCheck));
  //     formData.append("projectIdCheck", String(projectIdCheck));

  //     if (uploadedFile) {
  //       formData.append("file", uploadedFile);
  //     }

  //     if (multipleUrls.length > 0) {
  //       formData.append(
  //         "multipleUrls",
  //         JSON.stringify(multipleUrls)
  //       );
  //     }

  //     await axios.post(
  //       `${BASE_URL}/api/admin/surveys`,
  //       formData,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     alert("Survey Saved Successfully");
  //     onClose();
  //   } catch (err) {
  //     const backendMessage =
  //       err.response?.data?.message || "Error saving survey";
  //     setError(backendMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


/* ===================================================
   SAVE (CREATE OR UPDATE) WITH CSRF
=================================================== */
const handleSave = async () => {
  setError("");

  if (!groupId) return setError("Group ID missing.");
  if (!projectId) return setError("Project ID missing.");

  if (urlType === "Single" && !liveUrl) {
    return setError("Live URL is required.");
  }

  if (urlType === "Multiple" && !uploadedFile && !existingFileName) {
    return setError("Please upload a file.");
  }

  try {
    setLoading(true);

    const authToken = localStorage.getItem("token");

    if (!authToken) {
      throw new Error("Session expired. Please log in again.");
    }

    // Step 1: Get CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const csrfToken = csrfResponse.data?.csrfToken;

    if (!csrfToken) {
      throw new Error("Failed to retrieve CSRF token.");
    }

    // Step 2: Prepare form data
    const formData = new FormData();

    formData.append("groupId", groupId);
    formData.append("projectId", projectId);
    formData.append("type", urlType);
    formData.append("liveUrl", liveUrl || "");
    formData.append("testUrl", testUrl || "");
    formData.append("ipCheck", String(ipCheck));
    formData.append("projectIdCheck", String(projectIdCheck));

    if (uploadedFile) {
      formData.append("file", uploadedFile);
    }

    if (multipleUrls.length > 0) {
      formData.append(
        "multipleUrls",
        JSON.stringify(multipleUrls)
      );
    }

    // Step 3: Save survey with CSRF token
    await axios.post(
      `${BASE_URL}/api/admin/surveys`,
      formData,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    alert("Survey Saved Successfully");
    onClose();
  } catch (err) {
    console.error(
      "Survey save error:",
      err.response?.data || err
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Error saving survey"
    );
  } finally {
    setLoading(false);
  }
};

  /* ===================================================
     DOWNLOAD EXISTING FILE
  =================================================== */
  const handleDownload = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/surveys/group/${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data.uploadedFilePath) {
        alert("No file available");
        return;
      }

      window.open(
        `${BASE_URL}/${res.data.uploadedFilePath}`,
        "_blank"
      );
    } catch (err) {
      alert("Download failed");
    }
  };

  /* ===================================================
     UI
  =================================================== */

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[700px] rounded-xl shadow-xl p-6 space-y-6">

        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold">Survey URLs</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div>
          <label>URL Type</label>
          <select
            value={urlType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="border w-full p-2 rounded mt-1"
          >
            <option value="Single">Single URL</option>
            <option value="Multiple">Multiple URL</option>
          </select>
        </div>

        {urlType === "Single" && (
          <>
            <div>
              <label>Live URL *</label>
              <input
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="border w-full p-2 rounded mt-1"
              />
            </div>

            <div>
              <label>Test URL</label>
              <input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="border w-full p-2 rounded mt-1"
              />
            </div>
          </>
        )}

        {urlType === "Multiple" && (
          <div>
            <input
              type="file"
              accept=".txt,.png,.jpeg,.jpg,.pdf,.xlsx,.xls,.csv"
              onChange={handleFileUpload}
            />

            {(uploadedFile || existingFileName) && (
              <button
                onClick={handleDownload}
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                <FaDownload /> Download
              </button>
            )}

            {existingFileName && (
              <p className="text-sm text-green-600 mt-2">
                Uploaded: {existingFileName}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-6">
          <label>
            <input
              type="checkbox"
              checked={ipCheck}
              onChange={() => setIpCheck(!ipCheck)}
            />
            IP Check
          </label>

          <label>
            <input
              type="checkbox"
              checked={projectIdCheck}
              onChange={() =>
                setProjectIdCheck(!projectIdCheck)
              }
            />
            Project ID Check
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-center">{error}</div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 text-white px-8 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}