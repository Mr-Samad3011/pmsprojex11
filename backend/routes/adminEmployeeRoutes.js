import express from "express";
import {
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  blockEmployee
} from "../controllers/adminEmployeeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= EMPLOYEE ROUTES ================= */

// ✅ GET all employees (ADMIN only)
router.get("/", verifyToken(["Admin"]), getAllEmployees);

// ✅ UPDATE employee (ADMIN only)
router.put("/:id", verifyToken(["Admin"]), updateEmployee);

// ✅ DELETE employee (ADMIN only)
router.delete("/:id", verifyToken(["Admin"]), deleteEmployee);

// ✅ BLOCK / UNBLOCK employee (ADMIN only)
router.put("/block/:id", verifyToken(["Admin"]), blockEmployee);

export default router;
