//surveyRoutes.js
import express from "express";
import Survey from "../models/Survey.js";
import Group from "../models/Group.js";
import multer from "multer";
import mongoose from "mongoose";
import { Parser } from "json2csv";

const router = express.Router();

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


/* =========================================================
   CREATE OR UPDATE SURVEY (ONE PER GROUP)
========================================================= */

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const {
      groupId,
      projectId,
      type,
      liveUrl,
      testUrl,
      ipCheck,
      projectIdCheck,
      multipleUrls,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!groupId || !projectId || !type) {
      return res.status(400).json({
        message: "groupId, projectId and type are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    /* ---------------- FIND GROUP ---------------- */

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    /* ---------------- PREPARE DATA ---------------- */

    let surveyData = {
      groupId,
      projectId,
      type,
      liveUrl,
      testUrl,
      ipCheck: ipCheck === "true" || ipCheck === true,
      projectIdCheck:
        projectIdCheck === "true" || projectIdCheck === true,
    };

    // Multiple URLs parse safe
    if (multipleUrls) {
      try {
        surveyData.multipleUrls =
          typeof multipleUrls === "string"
            ? JSON.parse(multipleUrls)
            : multipleUrls;
      } catch (e) {
        return res.status(400).json({
          message: "Invalid multipleUrls format",
        });
      }
    }

    // File handling
    if (req.file) {
      surveyData.uploadedFileName = req.file.originalname;
      surveyData.uploadedFilePath = req.file.path;
    }

    let survey;

    /* =====================================
       IF SURVEY EXISTS → UPDATE
    ===================================== */

    if (group.survey) {
      survey = await Survey.findByIdAndUpdate(
        group.survey,
        surveyData,
        { new: true }
      );

      // 🔥 Safety: if survey missing but group has reference
      if (!survey) {
        survey = await Survey.create(surveyData);
        group.survey = survey._id;
        await group.save();
      }

    } else {
      /* =====================================
         CREATE NEW SURVEY
      ===================================== */

      survey = await Survey.create(surveyData);

      // 🔥 VERY IMPORTANT LINK
      group.survey = survey._id;
      await group.save();
    }

    res.status(200).json({
      message: "Survey saved successfully",
      survey,
    });

  } catch (err) {
    console.error("Create/Update Survey Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   GET SURVEY BY GROUP
========================================================= */

router.get("/group/:groupId", async (req, res) => {
  try {
    const survey = await Survey.findOne({
      groupId: req.params.groupId,
    });

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    res.json(survey);
  } catch (err) {
    console.error("Get Survey Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   UPDATE STATUS
========================================================= */

router.put("/:id/status", async (req, res) => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    res.json(survey);
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   DELETE SURVEY (AND REMOVE FROM GROUP)
========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Remove reference from group
    await Group.findByIdAndUpdate(survey.groupId, {
      $unset: { survey: 1 },
    });

    await Survey.findByIdAndDelete(req.params.id);

    res.json({ message: "Survey deleted successfully" });

  } catch (err) {
    console.error("Delete Survey Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// router.get("/group/:id/download", async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.id)
//       .populate("survey")
//       .populate("projectId");

//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     // Format employee CPI
//     const employeeCPI =
//       group.bidSpecs?.employeeCPI?.length > 0
//         ? group.bidSpecs.employeeCPI
//             .map((e) => `${e.employeeCode}:${e.cpi}`)
//             .join(" | ")
//         : "";

//     // Format employee Quota
//     const employeeQuota =
//       group.bidSpecs?.employeeQuota?.length > 0
//         ? group.bidSpecs.employeeQuota
//             .map((e) => `${e.employeeCode}:${e.quota}`)
//             .join(" | ")
//         : "";

//     const data = [
//       {
       
//         SurveyID: group.surveyId || "",

//         Country: group.bidSpecs?.country || "",
//         Language: group.bidSpecs?.language || "",
//         Incidence: group.bidSpecs?.incidence || "",
//         LOI: group.bidSpecs?.loi || "",
//         CPI: group.bidSpecs?.cpi || "",

//         StartDate: group.bidSpecs?.startDate || "",
//         EndDate: group.bidSpecs?.endDate || "",

//         TargetCompletes: group.bidSpecs?.completes || "",
//         CMP: group.stats?.completes || 0, // ✅ Completed count column

//         QuotaDetail: group.bidSpecs?.quotaDetail || "",

//         EmployeeCPI: employeeCPI,
//         EmployeeQuota: employeeQuota,

//         LiveURL: group.survey?.liveUrl || "",
//         TestURL: group.survey?.testUrl || "",
//       },
//     ];

//     const parser = new Parser();
//     const csv = parser.parse(data);

//     res.header("Content-Type", "text/csv");
//     res.attachment(`Survey-${group.surveyId}.csv`);
//     return res.send(csv);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });
router.get("/group/:id/download", async (req, res) => {
  console.log("🚀 DOWNLOAD ROUTE HIT");

  try {
    const group = await Group.findById(req.params.id)
      .populate("survey")
      .populate("projectId");

    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }

    // ================= DEBUG LOGS =================
    console.log("===== DOWNLOAD DEBUG =====");
    console.log("Project Status:", group.projectId?.status);
    console.log("Group Status:", group.status);
    console.log("Survey Exists:", !!group.survey);
    console.log("Survey Live URL:", group.survey?.liveUrl);
    console.log("===========================");
    // ==============================================

    // 🔒 1️⃣ Project must be Live
    if (group.projectId?.status !== "Live") {
      console.log("❌ Project not Live");
      return res.status(400).json({
        message: "Project is Paused. Cannot download survey.",
      });
    }

    // 🔒 2️⃣ Group must be Live
    if (group.status !== "Live") {
      console.log("❌ Group not Live");
      return res.status(400).json({
        message: "Group is not Live.",
      });
    }

    // 🔒 3️⃣ Survey must exist
    if (!group.survey) {
      console.log("❌ Survey not found");
      return res.status(404).json({
        message: "Survey not found.",
      });
    }

    // 🔒 4️⃣ Survey must have at least one URL
    if (!group.survey.liveUrl && !group.survey.testUrl) {
      console.log("❌ Survey URLs missing");
      return res.status(400).json({
        message: "Survey URLs not configured.",
      });
    }

    // ================= FORMAT EMPLOYEE DATA =================
    const employeeCPI =
      group.bidSpecs?.employeeCPI?.length > 0
        ? group.bidSpecs.employeeCPI
            .map((e) => `${e.employeeCode}:${e.cpi}`)
            .join(" | ")
        : "";

    const employeeQuota =
      group.bidSpecs?.employeeQuota?.length > 0
        ? group.bidSpecs.employeeQuota
            .map((e) => `${e.employeeCode}:${e.quota}`)
            .join(" | ")
        : "";

    // ================= CSV DATA =================
    const data = [
      {
        SurveyID: group.surveyId || "",
        Country: group.bidSpecs?.country || "",
        Language: group.bidSpecs?.language || "",
        Incidence: group.bidSpecs?.incidence || "",
        LOI: group.bidSpecs?.loi || "",
        CPI: group.bidSpecs?.cpi || "",
        StartDate: group.bidSpecs?.startDate || "",
        EndDate: group.bidSpecs?.endDate || "",
        TargetCompletes: group.bidSpecs?.completes || "",
        CMP: group.stats?.completes || 0,
        QuotaDetail: group.bidSpecs?.quotaDetail || "",
        EmployeeCPI: employeeCPI,
        EmployeeQuota: employeeQuota,
        LiveURL: group.survey?.liveUrl || "",
        TestURL: group.survey?.testUrl || "",
      },
    ];

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`Survey-${group.surveyId}.csv`);

    console.log("✅ CSV SENT SUCCESSFULLY");

    return res.send(csv);

  } catch (err) {
    console.error("🔥 DOWNLOAD ERROR:", err);
    return res.status(500).json({
      message: "Server error while downloading survey",
    });
  }
});

export default router;