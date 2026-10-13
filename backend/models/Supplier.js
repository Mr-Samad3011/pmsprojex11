// import mongoose from "mongoose";

// const SupplierSchema = new mongoose.Schema({
//   supplierName: { type: String, required: true },
//   supplierType: { type: String, required: true },
//   category: { type: String },
//   status: { type: String, default: "Active" },

//   contactPerson: { type: String },
//   phone: { type: String },
//   alternatePhone: { type: String },
//   email: { type: String },
//   website: { type: String },

//   address1: { type: String },
//   address2: { type: String },
//   city: { type: String },
//   state: { type: String },
//   pincode: { type: String },
//   country: { type: String, default: "India" },

//   gstNumber: { type: String },
//   panNumber: { type: String },

//   supplyCategories: [String],
//   supportedProjectTypes: [String],
//   regionsServed: { type: String },
//   capacityPerMonth: { type: String },
//   paymentTerms: { type: String },
//   notes: { type: String },

//   createdAt: { type: Date, default: Date.now },
// });

// const Supplier = mongoose.model("Supplier", SupplierSchema);

// export default Supplier;


import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },

    address1: {
      type: String,
      required: true,
      trim: true,
    },

    address2: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      default: "India",
    },

    zip: {
      type: String,
      required: true,
      trim: true,
    },

    completeUrl: {
      type: String,
      required: true,
    },

    terminateUrl: {
      type: String,
      required: true,
    },

    quotafullUrl: {
      type: String,
      required: true,
    },

    securityTerminateUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", SupplierSchema);

export default Supplier;
