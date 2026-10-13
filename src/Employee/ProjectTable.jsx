// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import ProjectSpecificationModal from "../Employee/ProjectSpecificationModal";
// import SurveyLinksModal from "../Employee/SurveyLinksModal";

// const statusStyle = {
//   Live: "bg-green-100 text-green-800",
//   Paused: "bg-yellow-100 text-yellow-800",
//   Complete: "bg-blue-100 text-blue-800",
// };

// const actionOptions = [
//   "Project Specification",
//   "Data Download",
//   "Survey Links",
// ];

// export default function ProjectTable({ rowsPerPage = 10 }) {
//   const [projects, setProjects] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [specGroupId, setSpecGroupId] = useState(null);
//   const [surveyGroupId, setSurveyGroupId] = useState(null);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [pausedModal, setPausedModal] = useState(false);
//   const [launchWarningModal, setLaunchWarningModal] = useState(false);
//     const BASE_URL = import.meta.env.VITE_BACKEND_URL;
//   const token = localStorage.getItem("token");

//   /* ================= FETCH ================= */
// //   useEffect(() => {
// //     // const fetchProjects = async () => {
// //     //   try {
// //     //     const res = await axios.get(
// //     //       `${BASE_URL}/api/employee/projects`,
// //     //       {
// //     //         headers: { Authorization: `Bearer ${token}` },
// //     //       }
// //     //     );
// //     //     setProjects(res.data || []);
// //     //   } catch (err) {
// //     //     console.error(err);
// //     //     alert("Failed to load assigned projects");
// //     //   }
// //     // };
// //    const fetchProjects = async () => {
// //   try {
// //     const res = await axios.get(
// //       `${BASE_URL}/api/employee/projects`,
// //       {
// //         headers: { Authorization: `Bearer ${token}` },
// //       }
// //     );
// //     setProjects(res.data || []);
// //   } catch (err) {
// //     console.error(err);
// //     alert("Failed to load assigned projects");
// //   }
// // };
// //     fetchProjects();
// //   }, [token]);

// /* ================= FETCH PROJECTS FUNCTION ================= */
// const fetchProjects = async () => {
//   try {
//     const res = await axios.get(
//       `${BASE_URL}/api/employee/projects`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     setProjects(res.data || []);
//   } catch (err) {
//     console.error(err);
//     alert("Failed to load assigned projects");
//   }
// };

// /* ================= INITIAL LOAD ================= */
// useEffect(() => {
//   fetchProjects();
// }, [token]);

//   /* ================= FLATTEN GROUPS ================= */
//   const flatGroups = useMemo(() => {
//     return projects.flatMap((project) =>
//       (project.groups || []).map((group) => ({
//         ...group,
//         projectStatus: project.status,
//       }))
//     );
//   }, [projects]);

//   /* ================= PAGINATION ================= */
//   const totalPages = Math.ceil(flatGroups.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const currentData = flatGroups.slice(
//     startIndex,
//     startIndex + rowsPerPage
//   );

//   /* ================= CHECKBOX ================= */
//   const handleRowCheck = (id) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const handleMasterCheck = (e) => {
//     const ids = currentData.map((g) => g._id);
//     if (e.target.checked) {
//       setSelectedRows((prev) => [...new Set([...prev, ...ids])]);
//     } else {
//       setSelectedRows((prev) => prev.filter((id) => !ids.includes(id)));
//     }
//   };

//   const isMasterChecked =
//     currentData.length > 0 &&
//     currentData.every((g) => selectedRows.includes(g._id));

//   /* ================= DATA DOWNLOAD ================= */
//   const downloadCSV = async (group) => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/api/surveys/group/${group._id}/download`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           responseType: "blob",
//         }
//       );

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `survey_${group.surveyId}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error("Download failed:", error);
//       alert("Failed to download CSV");
//     }
//   };

//   /* ================= ACTION ================= */
//   // const handleActionClick = async (group, action) => {
//   //   setOpenDropdown(null);

//   //   if (action === "Project Specification") {
//   //     setSpecGroupId(group._id);
//   //     return;
//   //   }

//   //   if (action === "Survey Links") {
//   //     setSurveyGroupId(group._id);
//   //     return;
//   //   }

//   //   if (action === "Data Download") {
//   //     await downloadCSV(group);
//   //     return;
//   //   }
//   // };

// const handleActionClick = async (group, action) => {
//   setOpenDropdown(null);

//   if (group.status === "Paused") {
//     setPausedModal(true);
//     return;
//   }

//   // 🔹 Get logged-in user
//   const user = JSON.parse(localStorage.getItem("user"));

//   // 🔥 VERY IMPORTANT: id OR _id fallback
//   const empId = user?.id || user?._id;

//   console.log("========== DEBUG START ==========");
//   console.log("USER FROM LS:", user);
//   console.log("EMP ID (Frontend):", empId);
//   console.log("GROUP STATUS:", group.status);
//   console.log("FULL launchedBy ARRAY:", group.launchedBy);

//   const hasLaunched = group.launchedBy?.some((l, index) => {
//     const backendId =
//       typeof l.employee === "object"
//         ? l.employee?._id
//         : l.employee;

//     console.log(`-- Launch Entry ${index + 1} --`);
//     console.log("Backend Employee Raw:", l.employee);
//     console.log("Backend Employee ID:", backendId);
//     console.log("Frontend Employee ID:", empId);
//     console.log(
//       "Match?",
//       backendId?.toString() === empId?.toString()
//     );

//     return backendId?.toString() === empId?.toString();
//   });

//   console.log("FINAL hasLaunched:", hasLaunched);
//   console.log("========== DEBUG END ==========");

//   if (
//     group.status === "Live" &&
//     !hasLaunched &&
//     (action === "Survey Links" || action === "Data Download")
//   ) {
//     setLaunchWarningModal(true);
//     return;
//   }

//   if (action === "Project Specification") {
//     setSpecGroupId(group._id);
//     return;
//   }

//   if (action === "Survey Links") {
//     setSurveyGroupId(group._id);
//     return;
//   }

//   if (action === "Data Download") {
//     await downloadCSV(group);
//     return;
//   }
// };
//   /* ================= RENDER ================= */
//   return (
//     <>
//       <div className="bg-white shadow rounded mt-6 overflow-visible">
//         <table className="w-full text-sm border border-gray-300 table-fixed">
//           <thead className="bg-teal-500 text-white">
//             <tr>
//               <th className="px-3 py-2 border text-center">
//                 <input
//                   type="checkbox"
//                   checked={isMasterChecked}
//                   onChange={handleMasterCheck}
//                 />
//               </th>

//               {[
//                 "Survey ID",
//                 "CMP",
//                 "TE",
//                 "QF",
//                 "AB%",
//                 "IR%",
//                 "LOI",
//                 "CPI",
//                 "Status",
//                 "Action",
//               ].map((h) => (
//                 <th key={h} className="px-3 py-2 border text-center">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {currentData.length > 0 ? (
//               currentData.map((g) => {
//                 const starts = g.stats?.starts || 0;
//                const completes = g.bidSpecs?.completes || 0;  // ✅ CMP data
//                 const terminates = g.stats?.terminates || 0;
//                 const quotaFull = g.stats?.quotaFull || 0;

//                 const abandon = starts
//                   ? (((starts - completes) / starts) * 100).toFixed(1)
//                   : 0;

//                 return (
//                   <tr key={g._id} className="hover:bg-gray-50">
//                     <td className="px-3 py-2 border text-center">
//                       <input
//                         type="checkbox"
//                         checked={selectedRows.includes(g._id)}
//                         onChange={() => handleRowCheck(g._id)}
//                       />
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       {g.surveyId}
//                     </td>

//                     <td className="px-3 py-2 border text-center font-semibold text-green-700">
//                       {completes}   {/* ✅ CMP column */}
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       {terminates}
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       {quotaFull}
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       {abandon}%
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       {g.bidSpecs?.incidence || 0}%
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       {g.bidSpecs?.loi || 0}
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       {g.bidSpecs?.cpi || 0}
//                     </td>

//                     <td className="px-3 py-2 border text-center">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                           statusStyle[g.status]
//                         }`}
//                       >
//                         {g.status}
//                       </span>
//                     </td>

//                     <td className="px-3 py-2 border text-center relative">
//                       <button
//                       onClick={() => {
//   if (g.status === "Paused") {
//     setPausedModal(true);
//     return;
//   }

//   setOpenDropdown(
//     openDropdown === g._id ? null : g._id
//   );
// }}
//                         className="bg-teal-500 text-white px-3 py-1 rounded text-xs"
//                       >
//                         Actions
//                       </button>

//                       {openDropdown === g._id && (
//                         <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
//                           {actionOptions.map((item) => (
//                             <button
//                               key={item}
//                               onClick={() => handleActionClick(g, item)}
//                               className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
//                             >
//                               {item}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan="10" className="py-6 text-center text-gray-500">
//                   No surveys assigned
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* PAGINATION */}
//       <div className="flex justify-end items-center gap-2 mt-4">
//         <button
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage((p) => p - 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           Prev
//         </button>

//         <span className="px-3 py-1 border rounded bg-gray-100">
//           {currentPage} / {totalPages || 1}
//         </span>

//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => setCurrentPage((p) => p + 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>

//       {pausedModal && (
//   <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//     <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
//       <h2 className="text-lg font-semibold text-red-600 mb-3">
//         Survey Paused
//       </h2>

//       <p className="text-sm text-gray-600 mb-5">
//         This survey has been paused so you can't work on this survey.
//         Please work on another survey.
//       </p>

//       <button
//         onClick={() => setPausedModal(false)}
//         className="bg-teal-500 text-white px-4 py-2 rounded"
//       >
//         OK
//       </button>
//     </div>
//   </div>
// )}

// {launchWarningModal && (
//   <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//     <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
//       <h2 className="text-lg font-semibold text-orange-600 mb-3">
//         Launch Required
//       </h2>

//       <p className="text-sm text-gray-600 mb-5">
//         Please launch the project first to access survey links or download data.
//       </p>

//       <button
//         onClick={() => setLaunchWarningModal(false)}
//         className="bg-teal-500 text-white px-4 py-2 rounded"
//       >
//         OK
//       </button>
//     </div>
//   </div>
// )}

//       {specGroupId && (
//         <ProjectSpecificationModal
//           groupId={specGroupId}
//           onClose={() => setSpecGroupId(null)}
//           onLaunchSuccess={fetchProjects}   //
//         />
//       )}

//       {surveyGroupId && (
//         <SurveyLinksModal
//           groupId={surveyGroupId}
//           onClose={() => setSurveyGroupId(null)}
//         />
//       )}
//     </>
//   );
// }


import React, { useState, useMemo } from "react";
import axios from "axios";
import ProjectSpecificationModal from "../Employee/ProjectSpecificationModal";
import SurveyLinksModal from "../Employee/SurveyLinksModal";

const statusStyle = {
  Live: "bg-green-100 text-green-800",
  Paused: "bg-yellow-100 text-yellow-800",
  Complete: "bg-blue-100 text-blue-800",
};

const actionOptions = [
  "Project Specification",
  "Data Download",
  "Survey Links",
];

export default function ProjectTable({
  projects,
  selectedStatus,
  searchTerm,
  rowsPerPage = 10,
}) {

  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [specGroupId, setSpecGroupId] = useState(null);
  const [surveyGroupId, setSurveyGroupId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pausedModal, setPausedModal] = useState(false);
  const [launchWarningModal, setLaunchWarningModal] = useState(false);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  /* ================= FLATTEN GROUPS ================= */

  const flatGroups = useMemo(() => {
    return projects.flatMap((project) =>
      (project.groups || []).map((group) => ({
        ...group,
        projectStatus: project.status,
      }))
    );
  }, [projects]);

  /* ================= FILTER ================= */

  const filteredGroups = useMemo(() => {
    return flatGroups.filter((g) => {

      if (selectedStatus !== "All" && g.status !== selectedStatus) {
        return false;
      }

      if (
        searchTerm &&
        !g.surveyId?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [flatGroups, selectedStatus, searchTerm]);

  /* ================= SORT ================= */

  const sortedGroups = useMemo(() => {

    if (!sortColumn) return filteredGroups;

    return [...filteredGroups].sort((a, b) => {

      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === "completes") {
        valA = a.bidSpecs?.completes || 0;
        valB = b.bidSpecs?.completes || 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;

      return 0;
    });

  }, [filteredGroups, sortColumn, sortDirection]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(sortedGroups.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const currentData = sortedGroups.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  /* ================= CHECKBOX ================= */

  const handleRowCheck = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMasterCheck = (e) => {
    const ids = currentData.map((g) => g._id);

    if (e.target.checked) {
      setSelectedRows((prev) => [...new Set([...prev, ...ids])]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const isMasterChecked =
    currentData.length > 0 &&
    currentData.every((g) => selectedRows.includes(g._id));

  /* ================= DOWNLOAD ================= */

  const downloadCSV = async (group) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/surveys/group/${group._id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `survey_${group.surveyId}.csv`);

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error(error);
      alert("Failed to download CSV");
    }
  };

  /* ================= ACTION ================= */

  const handleActionClick = async (group, action) => {

    setOpenDropdown(null);

    if (group.status === "Paused") {
      setPausedModal(true);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const empId = user?.id || user?._id;

    const hasLaunched = group.launchedBy?.some((l) => {

      const backendId =
        typeof l.employee === "object"
          ? l.employee?._id
          : l.employee;

      return backendId?.toString() === empId?.toString();

    });

    if (
      group.status === "Live" &&
      !hasLaunched &&
      (action === "Survey Links" || action === "Data Download")
    ) {
      setLaunchWarningModal(true);
      return;
    }

    if (action === "Project Specification") {
      setSpecGroupId(group._id);
      return;
    }

    if (action === "Survey Links") {
      setSurveyGroupId(group._id);
      return;
    }

    if (action === "Data Download") {
      await downloadCSV(group);
      return;
    }

  };

  /* ================= SORT CLICK ================= */

  const handleSort = (column) => {

    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

  };

  /* ================= RENDER ================= */

  return (
    <>

      <div className="bg-white shadow rounded mt-6 overflow-visible">

        <table className="w-full text-sm border border-gray-300 table-fixed">

          <thead className="bg-teal-500 text-white">

            <tr>

              <th className="px-3 py-2 border text-center">
                <input
                  type="checkbox"
                  checked={isMasterChecked}
                  onChange={handleMasterCheck}
                />
              </th>

              <th
                className="px-3 py-2 border text-center cursor-pointer"
                onClick={() => handleSort("surveyId")}
              >
                Survey ID
              </th>

              <th
                className="px-3 py-2 border text-center cursor-pointer"
                onClick={() => handleSort("completes")}
              >
                CMP
              </th>

              <th className="px-3 py-2 border text-center">TE</th>
              <th className="px-3 py-2 border text-center">QF</th>
              <th className="px-3 py-2 border text-center">AB%</th>
              <th className="px-3 py-2 border text-center">IR%</th>
              <th className="px-3 py-2 border text-center">LOI</th>
              <th className="px-3 py-2 border text-center">CPI</th>
              <th className="px-3 py-2 border text-center">Status</th>
              <th className="px-3 py-2 border text-center">Action</th>

            </tr>

          </thead>

          <tbody>

            {currentData.length > 0 ? (

              currentData.map((g) => {

                const starts = g.stats?.starts || 0;
                const completes = g.bidSpecs?.completes || 0;
                const terminates = g.stats?.terminates || 0;
                const quotaFull = g.stats?.quotaFull || 0;

                const abandon = starts
                  ? (((starts - completes) / starts) * 100).toFixed(1)
                  : 0;

                return (

                  <tr key={g._id} className="hover:bg-gray-50">

                    <td className="px-3 py-2 border text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(g._id)}
                        onChange={() => handleRowCheck(g._id)}
                      />
                    </td>

                    <td className="px-3 py-2 border text-center">
                      {g.surveyId}
                    </td>

                    <td className="px-3 py-2 border text-center font-semibold text-green-700">
                      {completes}
                    </td>

                    <td className="px-3 py-2 border text-center">
                      {terminates}
                    </td>

                    <td className="px-3 py-2 border text-center">
                      {quotaFull}
                    </td>

                    <td className="px-3 py-2 border text-center">
                      {abandon}%
                    </td>

                    <td className="px-3 py-2 border text-center">
                      {g.bidSpecs?.incidence || 0}%
                    </td>

                    <td className="px-3 py-2 border text-center">
                      {g.bidSpecs?.loi || 0}
                    </td>

                    <td className="px-3 py-2 border text-center">
                      {g.bidSpecs?.cpi || 0}
                    </td>

                    <td className="px-3 py-2 border text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[g.status]}`}
                      >
                        {g.status}
                      </span>
                    </td>

                    <td className="px-3 py-2 border text-center relative">

                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === g._id ? null : g._id
                          )
                        }
                        className="bg-teal-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Actions
                      </button>

                      {openDropdown === g._id && (

                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">

                          {actionOptions.map((item) => (

                            <button
                              key={item}
                              onClick={() => handleActionClick(g, item)}
                              className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                            >
                              {item}
                            </button>

                          ))}

                        </div>

                      )}

                    </td>

                  </tr>

                );

              })

            ) : (

              <tr>
                <td colSpan="10" className="py-6 text-center text-gray-500">
                  No surveys assigned
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="flex justify-end items-center gap-2 mt-4">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-3 py-1 border rounded bg-gray-100">
          {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>

      {specGroupId && (
        <ProjectSpecificationModal
          groupId={specGroupId}
          onClose={() => setSpecGroupId(null)}
        />
      )}

      {surveyGroupId && (
        <SurveyLinksModal
          groupId={surveyGroupId}
          onClose={() => setSurveyGroupId(null)}
        />
      )}

    </>
  );
}