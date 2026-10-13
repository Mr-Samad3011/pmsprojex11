// // models/AssignmentHistory.js
// import mongoose from "mongoose";

// const assignmentHistorySchema = new mongoose.Schema(
//   {
//     project: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     action: {
//       type: String,
//       enum: ["ASSIGNED", "REMOVED"],
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("assignmentHistory", assignmentHistorySchema);

import mongoose from "mongoose";

const assignmentHistorySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: {
    type: String,
    enum: ["ASSIGNED", "REMOVED"], // ✅ dono allowed
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("assignmentHistory", assignmentHistorySchema);
