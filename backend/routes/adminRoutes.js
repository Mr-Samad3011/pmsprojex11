// // routes/adminRoutes.js
// import express from "express";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import { verifyToken } from "../middleware/authMiddleware.js";
// import Project from "../models/Project.js";

// const router = express.Router();

// /* =========================
//    CREATE EMPLOYEE (ADMIN)
// ========================= */
// router.post("/create-employee", async (req, res) => {
//   try {
//     const { name, email, password, departments } = req.body;

//     // Check email
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ msg: "Email already exists" });
//     }

//     // Generate EMP ID
//     const lastUser = await User.findOne({ userId: { $exists: true } }).sort({
//       createdAt: -1,
//     });

//     let newId = "EMP001";
//     if (lastUser?.userId) {
//       const lastNumber = parseInt(lastUser.userId.replace("EMP", ""));
//       newId = `EMP${String(lastNumber + 1).padStart(3, "0")}`;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role: "employee",
//       userId: newId,
//       departments, // ✅ ARRAY
//     });

//     await newUser.save();

//     res.json({ msg: "Employee created successfully", user: newUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* =========================
//    GET ALL EMPLOYEES (ADMIN)
// ========================= */
// router.get("/employees", async (req, res) => {
//   try {
//     const employees = await User.find({ role: "employee" }).select(
//       "name email userId departments"
//     );
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ msg: "Failed to fetch employees" });
//   }
// });

// /* =========================
//    CREATE PROJECT (ADMIN)
// ========================= */
// router.post("/projects/create", verifyToken(["admin"]), async (req, res) => {
//   try {
//     const {
//       projectName,
//       country,
//       language,
//       department,
//       CPI,
//       LOI,
//       status,
//       surveyLink,
//       endPageLink,
//     } = req.body;

//     if (!projectName || !country || !language || !department || !CPI || !surveyLink) {
//       return res.status(400).json({ msg: "All required fields must be filled" });
//     }

//     const lastProject = await Project.findOne().sort({ createdAt: -1 });
//     let surveyId = "SURV001";

//     if (lastProject?.surveyId) {
//       const lastNum = parseInt(lastProject.surveyId.replace("SURV", ""));
//       surveyId = `SURV${String(lastNum + 1).padStart(3, "0")}`;
//     }

//     const newProject = new Project({
//       surveyId,
//       projectName,
//       country,
//       language,
//       department,
//       CPI,
//       LOI,
//       status: status || "Live",
//       surveyLink,
//       endPageLink,
//       createdBy: req.user.id,
//     });

//     await newProject.save();

//     res.json({ msg: "Project created successfully", project: newProject });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* =========================
//    GET ALL PROJECTS (ADMIN)
// ========================= */
// router.get("/projects", verifyToken(["admin"]), async (req, res) => {
//   try {
//     const projects = await Project.find()
//       .select("projectName surveyId department status")
//       .sort({ createdAt: -1 });

//     res.json(projects);
//   } catch (err) {
//     res.status(500).json({ msg: "Failed to fetch projects" });
//   }
// });

// /* =========================
//    GET EMPLOYEES BY DEPARTMENT
// ========================= */
// router.get(
//   "/employees-by-department/:department",
//   verifyToken(["admin"]),
//   async (req, res) => {
//     try {
//       const { department } = req.params;

//       console.log("Department from project:", department);

//       const employees = await User.find({
//         role: "employee",
//         // departments: department,  ✅ FIX
//         departments: { $in: [department] }, // ✅ CORRECT
//       }).select("name email userId departments");

//       console.log("Employees found:", employees);

//       res.json(employees);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Failed to fetch employees" });
//     }
//   }
// );


// /* =========================
//    ASSIGN PROJECT (ADMIN)
// ========================= */
// // router.post("/projects/assign", verifyToken(["admin"]), async (req, res) => {
// //   try {
// //     const { projectId, employeeIds } = req.body;

// //     if (!projectId || !employeeIds?.length) {
// //       return res.status(400).json({ msg: "Project and employees required" });
// //     }

// //     const project = await Project.findById(projectId);
// //     if (!project) {
// //       return res.status(404).json({ msg: "Project not found" });
// //     }

// //     project.assignedEmployees = employeeIds;
// //     await project.save();

// //     res.json({ msg: "Project assigned successfully", project });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });


// // router.post(
// //   "/projects/assign",
// //   verifyToken(["admin"]),
// //   async (req, res) => {
// //     try {
// //       const { projectId, employeeIds } = req.body;

// //       if (!projectId || !employeeIds?.length) {
// //         return res.status(400).json({ msg: "Project and employees required" });
// //       }

// //       // 🔹 Find project
// //       const project = await Project.findById(projectId);
// //       if (!project) {
// //         return res.status(404).json({ msg: "Project not found" });
// //       }

// //       // 🔹 Assign employees to project
// //       project.assignedEmployees = employeeIds;
// //       await project.save();

// //       // 🔹 ALSO update employees
// //       await User.updateMany(
// //         { _id: { $in: employeeIds } },
// //         { $addToSet: { assignedProjects: projectId } }
// //       );

// //       res.json({
// //         msg: "Project assigned successfully",
// //         projectId,
// //         employeeIds,
// //       });
// //     } catch (err) {
// //       console.error(err);
// //       res.status(500).json({ msg: "Server error" });
// //     }
// //   }
// // );

// router.post(
//   "/projects/assign",
//   verifyToken(["admin"]),
//   async (req, res) => {
//     try {
//       const { projectId, employeeIds } = req.body;

//       if (!projectId || !employeeIds.length) {
//         return res.status(400).json({ msg: "Missing data" });
//       }

//       // 1️⃣ Update project
//       const project = await Project.findByIdAndUpdate(
//         projectId,
//         {
//           $set: { assignedEmployees: employeeIds },
//         },
//         { new: true }
//       );

//       if (!project) {
//         return res.status(404).json({ msg: "Project not found" });
//       }

//       // 2️⃣ Update employees
//       const updateResult = await User.updateMany(
//         { _id: { $in: employeeIds } },
//         { $addToSet: { assignedProjects: projectId } }
//       );

//       console.log("Employee update result:", updateResult);

//       res.json({
//         msg: "Project assigned successfully",
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Assignment failed" });
//     }
//   }
// );


// // export default router;


// // routes/adminRoutes.js
// import express from "express";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import { verifyToken } from "../middleware/authMiddleware.js";
// import Project from "../models/Project.js";

// const router = express.Router();

// /* =========================
//    CREATE EMPLOYEE (ADMIN)
// ========================= */
// router.post("/create-employee", verifyToken(["admin"]), async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       departments,
//       position,
//       contactNumber,
//       dob,
//     } = req.body;

//     // 🔴 Validate required fields
//     if (
//       !firstName ||
//       !lastName ||
//       !email ||
//       !password ||
//       !departments ||
//       !position ||
//       !contactNumber ||
//       !dob
//     ) {
//       return res.status(400).json({ msg: "All fields are required" });
//     }

//     // 🔍 Check email exists
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ msg: "Email already exists" });
//     }

//     // 🆔 Generate EMP ID
//     const lastUser = await User.findOne({ userId: { $regex: /^EMP/ } }).sort({
//       createdAt: -1,
//     });

//     let newId = "EMP001";
//     if (lastUser?.userId) {
//       const lastNumber = parseInt(lastUser.userId.replace("EMP", ""));
//       newId = `EMP${String(lastNumber + 1).padStart(3, "0")}`;
//     }

//     // 🔐 Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Create User (MATCHES SCHEMA)
//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role: "employee",
//       userId: newId,
//       departments, // array
//       position,
//       contactNumber,
//       dob,
//     });

//     await newUser.save();

//     res.status(201).json({
//       msg: "Employee created successfully",
//       user: newUser,
//     });
//   } catch (err) {
//     console.error("CREATE EMPLOYEE ERROR:", err);
//     res.status(500).json({ msg: err.message });
//   }
// });

// /* =========================
//    GET ALL EMPLOYEES (ADMIN)
// ========================= */
// router.get("/employees", verifyToken(["admin"]), async (req, res) => {
//   try {
//     const employees = await User.find({ role: "employee" }).select(
//       "firstName lastName email userId departments position contactNumber dob"
//     );

//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ msg: "Failed to fetch employees" });
//   }
// });

// /* =========================
//    GET EMPLOYEES BY DEPARTMENT
// ========================= */
// router.get(
//   "/employees-by-department/:department",
//   verifyToken(["admin"]),
//   async (req, res) => {
//     try {
//       const { department } = req.params;

//       const employees = await User.find({
//         role: "employee",
//         departments: { $in: [department] },
//       }).select("firstName lastName email userId departments");

//       res.json(employees);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Failed to fetch employees" });
//     }
//   }
// );


// /* =========================
//    DASHBOARD DATA (ADMIN)
//    GET /api/admin/dashboard-data
// ========================= */
// router.get("/dashboard-data", verifyToken(["admin"]), async (req, res) => {
//   try {
//     // Get all employees
//     const employees = await User.find({ role: "employee" }).lean();

//     // Get all projects
//     const projects = await Project.find().lean();

//     let live = 0;
//     let paused = 0;
//     let closed = 0;
//     let totalRevenue = 0;
//     let pendingRevenue = 0;

//     // Count project status
//     projects.forEach((project) => {
//       if (project.status === "Live") live++;
//       if (project.status === "Paused") paused++;
//       if (project.status === "Closed") closed++;

//       totalRevenue += project.totalRevenue || 0;
//       pendingRevenue += project.pendingRevenue || 0;
//     });

//     // Employee workload mapping
//     const employeeData = employees.map((emp) => {
//       const empProjects = projects.filter((p) =>
//         p.assignedEmployees?.includes(emp._id)
//       );

//       return {
//         _id: emp._id,
//         firstName: emp.firstName,
//         lastName: emp.lastName,
//         department: emp.departments?.join(", "),
//         position: emp.position,
//         liveJobs: empProjects.filter((p) => p.status === "Live").length,
//         pausedJobs: empProjects.filter((p) => p.status === "Paused").length,
//         totalRevenue: empProjects.reduce(
//           (sum, p) => sum + (p.totalRevenue || 0),
//           0
//         ),
//         pendingRevenue: empProjects.reduce(
//           (sum, p) => sum + (p.pendingRevenue || 0),
//           0
//         ),
//       };
//     });

//     res.json({
//       employees: employeeData,
//       summary: {
//         live,
//         paused,
//         closed,
//         totalRevenue,
//         pendingRevenue,
//       },
//     });
//   } catch (err) {
//     console.error("Dashboard Error:", err);
//     res.status(500).json({ msg: "Failed to fetch dashboard data" });
//   }
// });




// export default router;

// routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middleware/authMiddleware.js";
import Project from "../models/Project.js";

const router = express.Router();

/* =========================
   CREATE EMPLOYEE (ADMIN)
========================= */
router.post("/create-employee", verifyToken(["admin"]), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      departments,
      position,
      contactNumber,
      dob,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !departments ||
      !position ||
      !contactNumber ||
      !dob
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Generate EMP ID
    const lastUser = await User.findOne({ userId: { $regex: /^EMP/ } }).sort({
      createdAt: -1,
    });

    let newId = "EMP001";
    if (lastUser?.userId) {
      const lastNumber = parseInt(lastUser.userId.replace("EMP", ""));
      newId = `EMP${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      
      userId: newId,
      departments, // array
      position,
      contactNumber,
      dob,
    });

    await newUser.save();

    res.status(201).json({
      msg: "Employee created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("CREATE EMPLOYEE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* =========================
   GET ALL EMPLOYEES (ADMIN)
   GROUPED BY DEPARTMENT
========================= */

router.get("/employees", verifyToken(["admin"]), async (req, res) => {
  try {
    const employees = await User.find({departments:"Employee" }).select(
      "firstName lastName email userId departments position contactNumber dob"
    );

    res.json(employees);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch employees" });
  }
});


router.get("/admins", verifyToken(["admin"]), async (req, res) => {
  try {
    const admins = await User.find({
      departments: { $regex: /^admin$/i }  // 👈 case-insensitive
     
      
    }).select(
      "firstName lastName email userId departments position contactNumber dob"
    );

    console.log("Admins",admins);

    

    res.json(admins);
     
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch admins" });
  }

});

router.put("/employees/:id", verifyToken(["Admin"]), async (req, res) => {
  try {
    const { userId, ...updateData } = req.body; // 🔥 userId remove

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
});



/* =========================
   GET EMPLOYEES BY SPECIFIC DEPARTMENT
========================= */
router.get(
  "/employees-by-department/:department",
  verifyToken(["admin"]),
  async (req, res) => {
    try {
      const { department } = req.params;

      const employees = await User.find({
        role: "employee",
        departments: { $in: [department] },
      }).select(
        "firstName lastName email userId departments position contactNumber dob"
      );

      res.json(employees);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to fetch employees" });
    }
  }
);

/* =========================
   DASHBOARD DATA (ADMIN)
========================= */
router.get("/dashboard-data", verifyToken(["admin"]), async (req, res) => {
  try {
    const employees = await User.find({departments:"Employee" }).lean();
    const projects = await Project.find().lean();

    let live = 0,
      paused = 0,
      closed = 0,
      totalRevenue = 0,
      pendingRevenue = 0;

    projects.forEach((project) => {
      if (project.status === "Live") live++;
      if (project.status === "Paused") paused++;
      if (project.status === "Closed") closed++;

      totalRevenue += project.totalRevenue || 0;
      pendingRevenue += project.pendingRevenue || 0;
    });

    // Employee workload mapping
    const employeeData = employees.map((emp) => {
      const empProjects = projects.filter((p) =>
        p.assignedEmployees?.includes(emp._id)
      );

      return {
        _id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.departments?.join(", "),
        position: emp.position,
        liveJobs: empProjects.filter((p) => p.status === "Live").length,
        pausedJobs: empProjects.filter((p) => p.status === "Paused").length,
        totalRevenue: empProjects.reduce(
          (sum, p) => sum + (p.totalRevenue || 0),
          0
        ),
        pendingRevenue: empProjects.reduce(
          (sum, p) => sum + (p.pendingRevenue || 0),
          0
        ),
      };
    });

    res.json({
      employees: employeeData,
      summary: {
        live,
        paused,
        closed,
        totalRevenue,
        pendingRevenue,
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ msg: "Failed to fetch dashboard data" });
  }
});

export default router;
