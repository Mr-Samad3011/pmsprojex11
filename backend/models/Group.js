// import mongoose from "mongoose";

// const groupSchema = new mongoose.Schema(
//   {
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },

//     groupName: { type: String, default: "Default Group" },
//     projectName: { type: String },

//    surveyId: {
//   type: String,
//   required: true,
//   // unique: true,
// },
// survey: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "Survey",
// },

//  status: {
//     type: String,
//     enum: ["Live", "Paused", "Completed"],
//     default: "Paused",
//   },



//     bidSpecs: {
//       groupName: {type: String,},
//       country: { type: String,   },
//       language: { type: String,},
//       startDate: Date,
//       endDate: Date,
//       incidence: { type: Number,  },
//       loi: { type: Number,  },
//       completes: { type: Number, },
//       cpi: { type: Number,  },
//       total: { type: Number, },
//        quotaDetail: { type: String },
      
//     },

//     stats: {
//       hits:{type: Number, default: 0},
//       visits: { type: Number, default: 0 },
//       starts: { type: Number, default: 0 },
//       completes: { type: Number, default: 0 },
//       terminates: { type: Number, default: 0 },
//       securityTerm: { type: Number, default: 0 },
//       quotaFull: { type: Number, default: 0 },
//       incidence: {type:Number,default:0},
//       medianLOI: {type:Number,default:0}
//     },
//   },

 
//   { timestamps: true }
// );

// // ✅ SAFE populate (NO next)
// groupSchema.pre(/^find/, function () {
//   this.populate({
//     path: "projectId",
//     select: "projectName customerName",
//   });
// });


// groupSchema.post("save", async function () {
//   const groups = await mongoose.model("Group")
//     .find({ projectId: this.projectId });

//   const totalRevenue = groups.reduce((sum, g) => {
//     return sum + (g.bidSpecs?.total || 0);
//   }, 0);

//   await mongoose.model("Project").findByIdAndUpdate(
//     this.projectId,
//     { totalRevenue }
//   );
// });

// export default mongoose.model("Group", groupSchema);


import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    groupName: {
      type: String,
      default: "Default Group",
    },

    projectName: {
      type: String,
    },

    surveyId: {
      type: String,
      required: true,
    },

    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
    },

    status: {
      type: String,
      enum: ["Live", "Paused", "Completed"], 
      default: "Paused",
    },

    // ---------------- Bid Specs ----------------
    bidSpecs: {
      groupName: String,
      country: String,
      language: String,
      startDate: Date,
      endDate: Date,
      incidence: Number,
      loi: Number,
      completes: Number,
      cpi: Number,
      total: Number,
      quotaDetail: String,
    },

    // ---------------- Stats ----------------
    stats: {
      hits: { type: Number, default: 0 },
      visits: { type: Number, default: 0 },
      starts: { type: Number, default: 0 },
      completes: { type: Number, default: 0 },
      terminates: { type: Number, default: 0 },
      securityTerm: { type: Number, default: 0 },
      quotaFull: { type: Number, default: 0 },
      incidence: { type: Number, default: 0 },
      medianLOI: { type: Number, default: 0 },
    },

    // ✅ FIXED — Now Inside Schema
    launchedBy: [
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    launchedAt: {
      type: Date,
      default: Date.now,
    },
  },
],
  },
  { timestamps: true }
);



// ---------------- SAFE AUTO POPULATE ----------------
groupSchema.pre(/^find/, function () {
  this.populate({
    path: "projectId",
    select: "projectName customerName status",
  });
});



// ---------------- AUTO UPDATE PROJECT REVENUE ----------------
groupSchema.post("save", async function () {
  const groups = await mongoose.model("Group")
    .find({ projectId: this.projectId });

  const totalRevenue = groups.reduce((sum, g) => {
    return sum + (g.bidSpecs?.total || 0);
  }, 0);

  await mongoose.model("Project").findByIdAndUpdate(
    this.projectId,
    { totalRevenue }
  );
});


export default mongoose.model("Group", groupSchema);