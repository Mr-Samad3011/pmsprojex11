


import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    /* =========================
       AUTO GENERATED
    ========================== */
    surveyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    /* =========================
       BASIC PROJECT INFO
    ========================== */
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       CONTACT & TEAM
    ========================== */

    // Simple string based contacts (manual entry)
    invoicingClientContact: {
      type: [String],
      default: [],
    },

    clientProjectLeader: {
      type: [String],
      default: [],
    },

    // 🔥 Linked Users (Populate Friendly)
    projectManager: { type: [String], default: [] },
    salesContact: { type: [String], default: [] },


   

    /* =========================
       TARGETING & CATEGORY
    ========================== */
    audienceType: {
      type: [String],
      
      default: [],
    },

    category: {
      type: [String], // Example: Tech, Health, Finance
      default: [],
    },

    deviceType: {
      type: [String],
      
      default: [],
    },

    projectType: {
      type: String,
      
      trim: true,
    },

    redirectType: {
      type: [String],
      
      default: [],
    },

    projectURL: {
      type: String,
      trim: true,
    },

    /* =========================
       RELATIONS & METADATA
    ========================== */

    createdBy: {
      type: [String],
      ref: "User",
      required: true,
    },

    assignedEmployees: [
      
        { type: mongoose.Schema.Types.ObjectId, ref: "User" } 
        
      ,
    ],

   status: {
  type: String,
  enum: ["Live", "Paused", "Completed"],
  default: "Live",
},
totalRevenue: {
  type: Number,
  default: 0,
},

    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
