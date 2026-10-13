import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import AssignmentHistory from "../models/assignmentHistory.js";
import Employee from "../models/User.js";
import Group from "../models/Group.js";

const router = express.Router();

/* =========================
   HELPER FUNCTIONS
========================= */

// Generate Survey ID (AMD001, AMD002…)
async function generateSurveyId() {
  const lastProject = await Project.findOne().sort({ createdAt: -1 });
  let surveyId = "AMD001";

  if (lastProject?.surveyId) {
    const lastNum = parseInt(lastProject.surveyId.replace("AMD", ""));
    surveyId = `AMD${String(lastNum + 1).padStart(3, "0")}`;
  }

  return surveyId;
}

// Normalize array fields (string or React Select object)
const normalizeArray = (field) => {
  if (!field) return [];
  if (!Array.isArray(field)) field = [field];

  return field.map((item) => {
    if (typeof item === "object" && item !== null) {
      return item.value || item._id || item;
    }
    return item;
  });
};

/* =========================
   CREATE PROJECT
   POST /api/admin/projects
========================= */
router.post("/", verifyToken(["admin"]), async (req, res) => {
  try {
    const {
      customerName,
      projectName,
      invoicingClientContact,
      clientProjectLeader,
      projectManager,
      salesContact,
      audienceType,
      category,
      deviceType,
      projectType,
      redirectType,
      projectURL,
      status,
    } = req.body;

    if (!customerName || !projectName) {
      return res.status(400).json({ msg: "Customer Name and Project Name are required" });
    }

    const surveyId = await generateSurveyId();

    const project = await Project.create({
      surveyId,
      customerName: customerName.trim(),
      projectName: projectName.trim(),
      invoicingClientContact: normalizeArray(invoicingClientContact),
      clientProjectLeader: normalizeArray(clientProjectLeader),
      projectManager: normalizeArray(projectManager),
      salesContact: normalizeArray(salesContact),
      audienceType: normalizeArray(audienceType),
      category: normalizeArray(category),
      deviceType: normalizeArray(deviceType),
      redirectType: normalizeArray(redirectType),
      projectType: typeof projectType === "object" ? projectType.value : projectType || "",
      projectURL: projectURL?.trim() || "",
      status: status || "Live",
      createdBy: req.user.id,
      groups: [],
    });

    res.status(201).json({ msg: "Project created successfully", project });
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* =========================
   GET PROJECT HISTORY
   GET /api/admin/projects/history
   MUST BE BEFORE /:id
========================= */
router.get("/history", verifyToken(["admin"]), async (req, res) => {
  try {
    const historyRecords = await AssignmentHistory.find()
      .populate("project", "projectName customerName")
      .populate("employee", "firstName lastName userId")
      .sort({ createdAt: -1 })
      .lean();

    const safeHistory = historyRecords.map((h) => ({
      _id: h._id,
      project: h.project || { projectName: "-", customerName: "-" },
      employee: h.employee || null,
      action: h.action || "-",
      createdAt: h.createdAt || new Date(),
    }));

    res.json({ history: safeHistory });
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
});

/* =========================
   GET PROJECT OPTIONS
   GET /api/admin/projects/project-options
   MUST BE BEFORE /:id
========================= */
// GET options for a specific customer
router.get("/project-options", verifyToken(["admin"]), async (req, res) => {
  try {
    const { customerName } = req.query;

    if (!customerName) {
      return res.status(400).json({ msg: "customerName is required" });
    }

    // 🔹 Projects of this customer
    const customerProjects = await Project.find({ customerName });

    // 🔹 Extract unique invoicing contacts & project leaders
    const invoicingContactsSet = new Set();
    const projectLeadersSet = new Set();

    customerProjects.forEach((p) => {
      p.invoicingClientContact.forEach((c) => invoicingContactsSet.add(c));
      p.clientProjectLeader.forEach((l) => projectLeadersSet.add(l));
    });

    // 🔹 Only employees with department="employee"
    const employees = await Employee.find({ departments: "Employee" }).lean();
const salesPersons = employees.map(e => `${e.firstName} ${e.lastName}`);
const managers = employees.map(e => `${e.firstName} ${e.lastName}`);

    res.json({
      invoicingContacts: Array.from(invoicingContactsSet),
      projectLeaders: Array.from(projectLeadersSet),
      salesPersons,
      managers,
    });
  } catch (err) {
    console.error("Project options error:", err);
    res.status(500).json({ msg: "Failed to fetch project options" });
  }
});
/* =========================
   GET ALL PROJECTS
   GET /api/admin/projects
========================= */
router.get("/", verifyToken(["admin"]), async (req, res) => {
  try {
    const { customerName, projectName, status, programmer } = req.query;
    const filter = {};

    if (customerName) filter.customerName = { $regex: customerName, $options: "i" };
    if (projectName) filter.projectName = { $regex: projectName, $options: "i" };
    if (status) filter.status = status;
    if (programmer) {
      filter.$or = [{ projectManager: programmer }, { salesContact: programmer }];
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("Fetch Projects Error:", err);
    res.status(500).json({ msg: "Failed to fetch projects" });
  }
});

/* =========================
   GET ALL PROJECTS (ADMIN)
   GET /api/admin/projects/all
========================= */
router.get("/all", verifyToken(["admin"]), async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("assignedEmployees", "firstName lastName userId")
      .lean();

    const safeProjects = projects.map((p) => ({
      ...p,
      assignedEmployees: Array.isArray(p.assignedEmployees) ? p.assignedEmployees : [],
    }));

    res.json({ projects: safeProjects });
  } catch (err) {
    console.error("Fetch all projects error:", err);
    res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
});

/* =========================
   GET PROJECT BY ID
   GET /api/admin/projects/:id
========================= */
// router.get("/:id", verifyToken(["admin", "employee"]), async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ msg: "Invalid project ID" });
//   }

//   try {
//     const project = await Project.findById(id);
//     if (!project) return res.status(404).json({ msg: "Project not found" });

//     const groups = await Group.find({ projectId: project._id });
//     res.json({ ...project.toObject(), groups });
//   } catch (err) {
//     console.error("Get Project Error:", err);
//     res.status(500).json({ msg: "Failed to fetch project" });
//   }
// });


router.get("/:id", verifyToken(["admin", "employee"]), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "Invalid project ID" });
  }

  try {
    const project = await Project.findById(id).lean();

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // 🔥 Get all groups of this project
    const groups = await Group.find({ projectId: project._id }).lean();

    // 🔥 Calculate total revenue
    let totalRevenue = 0;

    groups.forEach(group => {
      totalRevenue += group.bidSpecs?.total || 0;
    });

    res.json({
      ...project,
      groups,
      totalRevenue, // 🔥 send calculated value
    });

  } catch (err) {
    console.error("Get Project Error:", err);
    res.status(500).json({ msg: "Failed to fetch project" });
  }
});
/* =========================
   UPDATE PROJECT
   PUT /api/admin/projects/:id
========================= */
router.put("/:id", verifyToken(["admin"]), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ msg: "Invalid project ID" });

  try {
    const updateData = { ...req.body };
    if (updateData.projectManager) updateData.projectManager = normalizeArray(updateData.projectManager);
    if (updateData.salesContact) updateData.salesContact = normalizeArray(updateData.salesContact);
    if (updateData.clientProjectLeader) updateData.clientProjectLeader = normalizeArray(updateData.clientProjectLeader);
    if (updateData.invoicingClientContact) updateData.invoicingClientContact = normalizeArray(updateData.invoicingClientContact);
    if (typeof updateData.projectType === "object") updateData.projectType = updateData.projectType.value;

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
    if (!project) return res.status(404).json({ msg: "Project not found" });

    res.json({ msg: "Project updated successfully", project });
  } catch (err) {
    console.error("Update Project Error:", err);
    res.status(500).json({ msg: "Failed to update project" });
  }
});

/* =========================
   DELETE PROJECT
   DELETE /api/admin/projects/:id
========================= */
router.delete("/:id", verifyToken(["admin"]), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ msg: "Invalid project ID" });

  try {
    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    res.json({ msg: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ msg: "Failed to delete project" });
  }
});

/* =========================
   ASSIGN PROJECT
   POST /api/admin/projects/assign
========================= */
router.post("/assign", verifyToken(["admin"]), async (req, res) => {
  try {
    const { projectId, employeeIds } = req.body;

    if (!projectId || !employeeIds || employeeIds.length === 0) {
      return res.status(400).json({ msg: "Project ID and employee IDs are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { assignedEmployees: { $each: employeeIds } },
    });

    await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $addToSet: { assignedProjects: projectId } }
    );

    for (let empId of employeeIds) {
      await AssignmentHistory.create({
        project: projectId,
        employee: empId,
        action: "ASSIGNED",
      });
    }

    res.json({ msg: "Project assigned successfully" });
  } catch (err) {
    console.error("Assign Project Error:", err);
    res.status(500).json({ msg: "Assignment failed", error: err.message });
  }
});

router.post("/assign", verifyToken(["admin"]), async (req, res) => {
  try {
    const { projectId, employeeIds } = req.body;

    if (!projectId || !employeeIds || employeeIds.length === 0) {
      return res.status(400).json({ msg: "Project ID and employee IDs are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // 🔹 Add employees to project without duplicates
    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { assignedEmployees: { $each: employeeIds } },
    });

    // 🔹 Add project to employee side
    await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $addToSet: { assignedProjects: projectId } }
    );

    // 🔹 Log assignment in history (uppercase enum)
    for (let empId of employeeIds) {
      await AssignmentHistory.create({
        project: projectId,
        employee: empId,
        action: "ASSIGNED", // ✅ Must match enum in schema
      });
    }

    res.json({ msg: "Project assigned successfully" });
  } catch (err) {
    console.error("Assign Project Error:", err);
    res.status(500).json({ msg: "Assignment failed", error: err.message });
  }
});
/* =========================
   REMOVE EMPLOYEE FROM PROJECT
   POST /api/admin/projects/remove
========================= */
router.post("/remove", verifyToken(["admin"]), async (req, res) => {
  try {
    const { projectId, employeeId } = req.body;
    if (!projectId || !employeeId) {
      return res.status(400).json({ msg: "Project ID and employee ID required" });
    }

    await Project.findByIdAndUpdate(projectId, { $pull: { assignedEmployees: employeeId } });
    await Employee.findByIdAndUpdate(employeeId, { $pull: { assignedProjects: projectId } });

    await AssignmentHistory.create({
      project: projectId,
      employee: employeeId,
      action: "REMOVED",
    });

    res.json({ msg: "Employee removed successfully" });
  } catch (err) {
    console.error("Remove error:", err);
    res.status(500).json({ msg: "Remove failed", error: err.message });
  }
});

// UPDATE PROJECT STATUS ONLY
// router.patch("/:id/status", verifyToken(["admin"]), async (req, res) => {
//   try {
//     const { status } = req.body;

//     // ✅ Allowed values check
//     if (!["Live", "Paused", "Completed"].includes(status)) {
//       return res.status(400).json({ msg: "Invalid status value" });
//     }

//     const project = await Project.findById(req.params.id);
//     if (!project) {
//       return res.status(404).json({ msg: "Project not found" });
//     }

//     // ✅ Update project
//     project.status = status;
//     await project.save();

//     // 🔥 MAIN SYNC LOGIC
//     if (status === "Paused") {
//       // Project paused → All groups paused
//       await Group.updateMany(
//         { projectId: project._id },
//         { $set: { status: "Paused" } }
//       );
//     }

//     if (status === "Live") {
//       // Project live → All groups live
//       await Group.updateMany(
//         { projectId: project._id },
//         { $set: { status: "Live" } }
//       );
//     }

//     if (status === "Completed") {
//       // Project completed → All groups completed
//       await Group.updateMany(
//         { projectId: project._id },
//         { $set: { status: "Completed" } }
//       );
//     }

//     res.json({
//       msg: "Project & Group status updated successfully",
//       status,
//     });

//   } catch (err) {
//     console.error("Project Status Update Error:", err);
//     res.status(500).json({ msg: "Failed to update status" });
//   }
// });

router.patch("/:id/status", verifyToken(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Live", "Paused", "Completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Update project status
    project.status = status;
    await project.save();

    // 🔥 STATUS SYNC RULES

    if (status === "Paused") {
      // Project paused → All groups paused
      await Group.updateMany(
        { projectId: project._id },
        { $set: { status: "Paused" } }
      );
    }

    if (status === "Completed") {
      // Project completed → All groups completed
      await Group.updateMany(
        { projectId: project._id },
        { $set: { status: "Completed" } }
      );
    }

    // ❗ Project Live → groups change nahi honge

    res.json({
      msg: "Project status updated successfully",
      status,
    });

  } catch (err) {
    console.error("Project Status Update Error:", err);
    res.status(500).json({ msg: "Failed to update status" });
  }
});

// router.put("/:id/status", verifyToken(["admin"]), async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (!["Live", "Paused", "Completed"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status value" });
//     }

//     const project = await Project.findById(req.params.id);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     // Update project
//     project.status = status;
//     await project.save();

//     // Update all groups
//     await Group.updateMany(
//       { projectId: project._id },
//       { $set: { status } }
//     );

//     res.json({ message: "Project and groups updated successfully" });

//   } catch (error) {
//     console.error("Project Status Update Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


export default router;
