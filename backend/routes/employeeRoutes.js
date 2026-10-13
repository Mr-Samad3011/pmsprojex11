
import express from "express";
import Project from "../models/Project.js";
import Group from "../models/Group.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/* GET ASSIGNED PROJECTS WITH GROUPS */

// router.get("/projects", verifyToken(["Employee"]), async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // Assigned projects
//     const projects = await Project.find({
//       _id: { $in: user.assignedProjects },
//     }).sort({ createdAt: -1 });

//     // Projects ke groups attach kar do
//     const projectsWithGroups = await Promise.all(
//       projects.map(async (project) => {
//         const groups = await Group.find({ projectId: project._id }).sort({ createdAt: -1 });
//         return {
//           _id: project._id,
//           projectName: project.projectName,
//           status: project.status,
//           groups, // groups ke sare data yaha
//         };
//       })
//     );

//     res.json(projectsWithGroups);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Failed to fetch projects" });
//   }
// });


router.get("/projects", verifyToken(["Employee"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const projects = await Project.find({
      _id: { $in: user.assignedProjects },
    }).sort({ createdAt: -1 });

    const projectsWithGroups = await Promise.all(
      projects.map(async (project) => {
        const groups = await Group.find({ projectId: project._id })
          .populate({
            path: "launchedBy.employee",
            select: "_id firstName lastName userId",
          })
          .sort({ createdAt: -1 });

        return {
          _id: project._id,
          projectName: project.projectName,
          status: project.status,
          groups,
        };
      })
    );

    res.json(projectsWithGroups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch projects" });
  }
});
export default router;


