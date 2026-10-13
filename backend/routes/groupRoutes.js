//groupRoutes.js
import express from "express";
import mongoose from "mongoose";
import Group from "../models/Group.js";
import Project from "../models/Project.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();

/* ===============================
   CREATE OR UPDATE GROUP BID SPECS
   POST /groups/create
   =============================== */

router.post("/create", async (req, res) => {
  try {
    const { projectId, bidSpecs, groupName, employeeIds = [] } = req.body;

    // 🔹 Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    if (!bidSpecs?.country) {
      return res.status(400).json({ message: "Country is required" });
    }

    // 🔹 Fetch project
    const projectDoc = await Project.findById(projectId);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔹 Generate country short for surveyId
    const countryShort = bidSpecs.country.trim().slice(0, 2).toUpperCase();
    const finalSurveyId = `${projectDoc.surveyId}-${countryShort}`;

    // 🔹 Prevent duplicate country group
    const existingCountryGroup = await Group.findOne({
      projectId,
      "bidSpecs.country": bidSpecs.country,
      groupName: { $ne: groupName },
    });

    if (existingCountryGroup) {
      return res.status(400).json({
        message: `Group already exists for ${bidSpecs.country}`,
      });
    }

    // 🔹 Check if groupName exists (update case)
    let group = await Group.findOne({ projectId, groupName });

    if (group) {
      group.bidSpecs = { ...bidSpecs };
      group.surveyId = finalSurveyId;
      await group.save();
      return res.status(200).json(group);
    }

    // 🔹 Create new group
    group = new Group({
      projectId,
      projectName: projectDoc.projectName,
      groupName,
      surveyId: finalSurveyId,
      bidSpecs: { ...bidSpecs },
    });

    await group.save();

    // 🔹 Add group _id to project's `groups` array
    await Project.findByIdAndUpdate(projectId, {
      $push: { groups: group._id },
      // Optional: assign employees to project automatically
      $addToSet: { assignedEmployees: { $each: employeeIds } },
    });

    res.status(201).json(group);
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ===============================
   GET GROUP BY ID
   GET /groups/:id
   =============================== */
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid group ID" });
//     }

//     const group = await Group.findById(id).populate("projectId", "projectName customerName");
//     if (!group) return res.status(404).json({ message: "Group not found" });

//     res.json(group);
//   } catch (err) {
//     console.error("Get group error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

/* ===============================
   GET ALL GROUPS BY PROJECT ID
   GET /groups/by-project/:projectId
   =============================== */
router.get("/by-project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const groups = await Group.find({ projectId }).populate("projectId", "projectName customerName");
    res.json(groups);
  } catch (err) {
    console.error("Get groups by project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   UPDATE STATS
   POST /groups/update-stats/:id
   =============================== */
router.post("/update-stats/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const allowedTypes = [
      "hits",
      "visits",
      "starts",
      "completes",
      "terminates",
      "securityTerm",
      "quotaFull",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid stats type" });
    }

    const group = await Group.findByIdAndUpdate(
      id,
      { $inc: { [`stats.${type}`]: 1 } },
      { new: true }
    ).populate("projectId", "projectName customerName");

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Emit via Socket.io if available
    if (req.io) {
      req.io.emit("statsUpdated", { groupId: group._id, stats: group.stats });
    }

    res.json({ groupId: group._id, stats: group.stats });
  } catch (err) {
    console.error("Update stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/update-bidspecs/:id", async (req, res) => {
  try {
    const { bidSpecs } = req.body;

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "bidSpecs.language": bidSpecs.language,
          "bidSpecs.country": bidSpecs.country,
          "bidSpecs.startDate": bidSpecs.startDate,
          "bidSpecs.endDate": bidSpecs.endDate,
          "bidSpecs.incidence": bidSpecs.incidence,
          "bidSpecs.loi": bidSpecs.loi,
          "bidSpecs.completes": bidSpecs.completes,
          "bidSpecs.cpi": bidSpecs.cpi,
          "bidSpecs.total": bidSpecs.total,
           "bidSpecs.quotaDetail": bidSpecs.quotaDetail,
        },
      },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(updatedGroup);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});


/* ================= GET SINGLE GROUP FULL DATA ================= */
// router.get("/:id", async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.id)
//       .populate("survey") // survey bhi load hoga
//       .populate("projectId", "projectName customerName");

//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     res.json(group);
//   } catch (err) {
//     console.error("Get Group Error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

/* ================= GET SINGLE GROUP FULL DATA ================= */
router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("survey") // 🔥 Survey document load hoga
      .populate("projectId", "projectName customerName");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    console.error("Get Group Error:", err);
    res.status(500).json({ message: err.message });
  }
});


// UPDATE GROUP STATUS
// router.patch("/:id/status",  async (req, res) => {
//   try {
//     const { status } = req.body;

//     const group = await Group.findById(req.params.id).populate("projectId");

//     if (!group) {
//       return res.status(404).json({ msg: "Group not found" });
//     }

//     // ❌ If project paused → block
//     if (group.projectId.status === "Paused") {
//       return res.status(400).json({
//         msg: "Project is paused. Please make project Live first."
//       });
//     }

//     group.status = status;
//     await group.save();

//     res.json({
//       msg: "Group status updated successfully",
//       group
//     });

//   } catch (err) {
//     console.error("Group Status Error:", err);
//     res.status(500).json({ msg: "Failed to update group status" });
//   }
// });

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    // 🔥 1️⃣ Get Group
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    // 🔥 2️⃣ Get Project DIRECTLY (No populate risk)
    const project = await Project.findById(group.projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // 🔥 3️⃣ Strict Project Status Check (case-insensitive)
    if (project.status?.toLowerCase() === "paused") {
      return res.status(400).json({
        msg: "Project is paused. Please make project Live first."
      });
    }

    // 🔥 4️⃣ Completed group block
    if (group.status === "Completed") {
      return res.status(400).json({
        msg: "Completed group status cannot be changed."
      });
    }

    // 🔥 5️⃣ Update Group
    group.status = status;
    await group.save();

    // 🔥 6️⃣ Send Fresh Populated Data (UI sync ke liye)
    const updatedGroup = await Group.findById(group._id)
      .populate("projectId");

    res.json({
      msg: "Group status updated successfully",
      group: updatedGroup
    });

  } catch (err) {
    console.error("Group Status Error:", err);
    res.status(500).json({ msg: "Failed to update group status" });
  }
});

// router.put("/launch/:id", verifyToken(["Employee"]), async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.id);

//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     if (group.status !== "Live") {
//       return res.status(400).json({ message: "Survey is not live" });
//     }

//     const employeeObjectId = req.user.id;
//     const employeeCustomId = req.user.userId;

//     // ✅ FIX HERE
//     const employeeName = `${req.user.firstName} ${req.user.lastName}`;

//     // 🔍 Duplicate check
//     const alreadyLaunched = group.launchedBy.find(
//       (l) => l.employee.toString() === employeeObjectId.toString()
//     );

//     if (alreadyLaunched) {
//       return res.status(400).json({
//         message: "You already started this survey",
//       });
//     }

//     group.launchedBy.push({
//       employee: employeeObjectId,
//       employeeId: employeeCustomId,
//       employeeName: employeeName,
//       launchedAt: new Date(),
//     });

//     await group.save();

//     // 🔔 Socket Notification
//     req.io.emit("employeeLaunched", {
//       surveyId: group.surveyId,
//       employeeId: employeeCustomId,
//       employeeName: employeeName,
//       message: `${employeeName} started working on survey ${group.surveyId}`,
//     });

//     res.json({
//       success: true,
//       message: "Survey launched successfully",
//     });

//   } catch (error) {
//     console.error("Launch Error:", error);
//     res.status(500).json({
//       message: "Server error while launching survey",
//     });
//   }
// });


router.put("/launch/:id", verifyToken(["Employee"]), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (group.status !== "Live") {
      return res.status(400).json({
        message: "Survey is not live",
      });
    }

    // JWT payload se employee details
    const employeeObjectId = req.user?.id;
    const employeeCustomId = req.user?.userId;
    const firstName = req.user?.firstName;
    const lastName = req.user?.lastName;

    // Required values validate karein
    if (
      !employeeObjectId ||
      !employeeCustomId ||
      !firstName ||
      !lastName
    ) {
      console.error("Missing employee details in req.user:", req.user);

      return res.status(400).json({
        message: "Employee details missing. Please login again.",
      });
    }

    const employeeName = `${firstName} ${lastName}`.trim();

    // Duplicate launch check
    const alreadyLaunched = group.launchedBy.some(
      (item) =>
        String(item.employee) === String(employeeObjectId)
    );

    if (alreadyLaunched) {
      return res.status(400).json({
        message: "You already started this survey",
      });
    }

    // Schema ke sabhi required fields provide karein
    group.launchedBy.push({
      employee: employeeObjectId,
      employeeId: String(employeeCustomId),
      employeeName,
      launchedAt: new Date(),
    });

    await group.save();

    // Socket notification (available ho tabhi)
    if (req.io) {
      req.io.emit("employeeLaunched", {
        surveyId: group.surveyId,
        employeeId: String(employeeCustomId),
        employeeName,
        message: `${employeeName} started working on survey ${group.surveyId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Survey launched successfully",
      group,
    });
  } catch (error) {
    console.error("Launch Error:", error);

    return res.status(500).json({
      message: "Server error while launching survey",
      error: error.message,
    });
  }
});



export default router;
