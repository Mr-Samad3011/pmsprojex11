import Employee from "../models/User.js";

/* ================= GET ALL EMPLOYEES ================= */
export const getAllEmployees = async (req, res) => {
  try {
    // Exclude password from response
    const employees = await Employee.find({}, { password: 0 });
    res.json(employees);
  } catch (error) {
    console.error("Get Employees Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE EMPLOYEE ================= */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      departments,
      position,
      contactNumber,
      dob,
    } = req.body;

    // Build update object only with allowed fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (departments !== undefined)
      updateData.departments =
        typeof departments === "string" ? departments.split(",").map(d => d.trim()) : departments;
    if (position !== undefined) updateData.position = position;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (dob !== undefined) updateData.dob = dob;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, context: "query" } // run validators to ensure required fields
    ).select("-password"); // exclude password

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error("Update Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE EMPLOYEE ================= */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= BLOCK / UNBLOCK EMPLOYEE ================= */
export const blockEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    if (typeof blocked !== "boolean") {
      return res.status(400).json({ message: "Blocked must be true or false" });
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { blocked },
      { new: true }
    ).select("-password"); // exclude password

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      message: blocked ? "Employee blocked" : "Employee unblocked",
      employee,
    });
  } catch (error) {
    console.error("Block Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
