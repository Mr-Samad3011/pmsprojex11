

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔹 System Info
    // role: {
    //   type: String,
    //   enum: ["admin", "employee"],
    //   default: "employee",
    // },

    userId: {
      type: String,
      required: true,
      unique: true, // 👈 auto generated employee/admin ID
    },

    // 🔹 Employee Specific
    departments: {
      type: [String],
      required: function () {
        return this.role === "employee";
      },
    },

    position: {
      type: String,
      required: function () {
        return this.role === "employee";
      },
    },

    contactNumber: {
      type: String,
      required: function () {
        return this.role === "employee";
      },
    },

    dob: {
      type: Date,
      required: function () {
        return this.role === "employee";
      },
    },

    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  {
    timestamps: true, // 👈 createdAt & updatedAt
  }
);

export default mongoose.model("User", userSchema);
