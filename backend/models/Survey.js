import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    type: {
      type: String,
      enum: ["Single", "Multiple"],
      required: true,
    },

    liveUrl: { type: String },
    testUrl: { type: String },

    multipleUrls: [String],

    uploadedFileName: String,
    uploadedFilePath: String,

    ipCheck: { type: Boolean, default: true },
    projectIdCheck: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["Live", "Paused"],
      default: "Live",
    },

    
  },
  { timestamps: true }
);

// Auto populate
surveySchema.pre(/^find/, function () {
  this.populate("groupId", "groupName")
      .populate("projectId", "projectName customerName");
});

export default mongoose.model("Survey", surveySchema);
