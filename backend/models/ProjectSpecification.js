// models/ProjectSpecification.js
import mongoose from "mongoose";

const quotaSchema = new mongoose.Schema({
  quotaName: String,
  value: String,
});

const vendorQuotaSchema = new mongoose.Schema({
  vendorCode: String,
  quota: String,
});

const vendorSchema = new mongoose.Schema({
  vendorCode: String,
  CPI: String,
  vendorQuota: [vendorQuotaSchema],
});

const projectSpecificationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true, // one spec per project
    },

    detail: {
      sampleType: String,
      studyType: String,
      collectsPII: String,
      countryName: String,
      IR: String,
      LOI: String,
    },

    quotas: [quotaSchema],
    vendors: [vendorSchema],
  },
  { timestamps: true }
);

export default mongoose.model(
  "ProjectSpecification",
  projectSpecificationSchema
);
