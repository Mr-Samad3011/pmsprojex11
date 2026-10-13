import express from "express";
import ProjectSpecification from "../models/ProjectSpecification.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/:projectId",
  verifyToken(["admin", "employee"]),
  async (req, res) => {
    try {
      const spec = await ProjectSpecification.findOne({
        projectId: req.params.projectId,
      });

      if (!spec) {
        return res.status(404).json({ message: "Specification not found" });
      }

      res.status(200).json(spec);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
