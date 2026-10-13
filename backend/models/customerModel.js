// import mongoose from "mongoose";

// const customerSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Customer name is required"],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, "Email is required"],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
//   },
//   phone: {
//     type: String,
//     required: [true, "Phone number is required"],
//     unique: true,
//     trim: true,
//     match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
//   },
//   address: { type: String, trim: true },
//   city: { type: String, trim: true },
//   state: { type: String, trim: true },
//   country: { type: String, trim: true },
//   zipCode: { type: String, trim: true },
//   website:{type:String,trim:true},
//   taxNumber:{type:String,trim:true},
//   notes: { type: String, trim: true },
// }, { timestamps: true });

// const Customer = mongoose.model("Customer", customerSchema);

// export default Customer;



import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
   
   
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    contacts: {
      type: [contactSchema],
      default: [], // 🔥 empty array allowed
    },

    address1: String,
    address2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,

    website: String,
    taxNumber: String,

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
