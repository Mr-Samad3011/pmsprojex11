// import express from "express";
// import Customer from "../models/customerModel.js";
// import { verifyToken } from "../middleware/authMiddleware.js"; // JWT auth

// const router = express.Router();

// // ================= MIDDLEWARE =================
// // All routes protected: only admin
// router.use(verifyToken(["admin"]));

// // ================= CREATE Customer =================
// // router.post("/", async (req, res) => {
// //   try {
// //     const { name, email, phone } = req.body;
// //     if (!name || !email || !phone) {
// //       return res.status(400).json({ message: "Name, email, and phone are required" });
// //     }

// //     const customer = new Customer(req.body);
// //     const savedCustomer = await customer.save();
// //     res.status(201).json(savedCustomer);
// //   } catch (error) {
// //     console.error("CREATE CUSTOMER ERROR:", error.message);
// //     res.status(400).json({ message: error.message });
// //   }
// // });

// router.post("/", async (req, res) => {
//   try {
//     const {
//       customerName,
//       address1,
//       address2,
//       city,
//       state,
//       country,
//       zipCode,
//       website,
//       taxNumber,
//       notes,
//     } = req.body;

//     // ✅ Only customerName required
//     if (!customerName) {
//       return res
//         .status(400)
//         .json({ message: "Customer name is required" });
//     }

//     const customer = new Customer({
//       customerName,
//       address1,
//       address2,
//       city,
//       state,
//       country,
//       zipCode,
//       website,
//       taxNumber,
//       notes,
//       contacts: [], // 🔥 contacts empty on create
//     });

//     const savedCustomer = await customer.save();

//     res.status(201).json(savedCustomer);
//   } catch (error) {
//     console.error("CREATE CUSTOMER ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// });


// // ================= READ all Customers =================
// router.get("/", async (req, res) => {
//   try {
//     const customers = await Customer.find().sort({ createdAt: -1 });
//     res.json(customers);
//   } catch (error) {
//     console.error("GET CUSTOMERS ERROR:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= READ single Customer by ID =================
// router.get("/:id", async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id);
//     if (!customer) return res.status(404).json({ message: "Customer not found" });
//     res.json(customer);
//   } catch (error) {
//     console.error("GET CUSTOMER BY ID ERROR:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= UPDATE Customer =================
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });
//     res.json(updatedCustomer);
//   } catch (error) {
//     console.error("UPDATE CUSTOMER ERROR:", error.message);
//     res.status(400).json({ message: error.message });
//   }
// });

// // ================= DELETE Customer =================
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Customer.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Customer not found" });
//     res.json({ message: "Customer deleted successfully" });
//   } catch (error) {
//     console.error("DELETE CUSTOMER ERROR:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// });


// /* ================= ADD CONTACT ================= */
// /* ================= ADD CONTACT ================= */
// // ================= ADD CONTACT =================
// router.post("/:customerId/contacts", async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.customerId);
//     if (!customer)
//       return res.status(404).json({ message: "Customer not found" });

//     const { firstName, lastName, email, phone } = req.body;

//     if (!firstName || !lastName || !email || !phone) {
//       return res.status(400).json({
//         message: "First Name, Last Name, Email, and Phone are required",
//       });
//     }

//     const newContact = {
//       name: `${firstName} ${lastName}`.trim(),
//       email,
//       phone,
//     };

//     customer.contacts.push(newContact);
//     await customer.save();

//     res.json(customer);
//   } catch (err) {
//     console.error("ADD CONTACT ERROR:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });


// /* ================= EDIT CONTACT ================= */
// router.put("/:customerId/contacts/:index", async (req, res) => {
//   try {
//     const { customerId, index } = req.params;
//     const customer = await Customer.findById(customerId);

//     if (!customer)
//       return res.status(404).json({ message: "Customer not found" });

//     if (!customer.contacts[index])
//       return res.status(404).json({ message: "Contact not found" });

//     const { firstName, lastName, email, phone } = req.body;

//     // Validate required fields
//     if (!firstName || !lastName || !email || !phone) {
//       return res
//         .status(400)
//         .json({ message: "First Name, Last Name, Email, and Phone are required" });
//     }

//     const updatedContact = {
//       name: `${firstName} ${lastName}`.trim(),
//       email,
//       phone
//     };

//     // Update contact at given index
//     customer.contacts[index] = updatedContact;
//     await customer.save();

//     res.json(customer);
//   } catch (err) {
//     console.error("EDIT CONTACT ERROR:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });



// export default router;


import express from "express";
import Customer from "../models/customerModel.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // JWT auth

const router = express.Router();

// ================= MIDDLEWARE =================
// All routes protected: only admin
router.use(verifyToken(["admin"]));

// ================= CREATE CUSTOMER =================
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      website,
      taxNumber,
      notes,
    } = req.body;

    if (!customerName) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    const customer = new Customer({
      customerName,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      website,
      taxNumber,
      notes,
      contacts: [],
    });

    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ================= GET ALL CUSTOMERS =================
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= GET CUSTOMER BY ID =================
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    console.error("GET CUSTOMER BY ID ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE CUSTOMER =================
router.put("/:id", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });
    res.json(updatedCustomer);
  } catch (error) {
    console.error("UPDATE CUSTOMER ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// ================= DELETE CUSTOMER =================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= ADD CONTACT =================
router.post("/:customerId/contacts", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        message: "First Name, Last Name, Email, and Phone are required",
      });
    }

    const newContact = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
    };

    customer.contacts.push(newContact);
    await customer.save();

    res.json(customer);
  } catch (err) {
    console.error("ADD CONTACT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ================= EDIT CONTACT =================
router.put("/:customerId/contacts/:index", async (req, res) => {
  try {
    const { customerId, index } = req.params;
    const customer = await Customer.findById(customerId);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (!customer.contacts[index])
      return res.status(404).json({ message: "Contact not found" });

    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        message: "First Name, Last Name, Email, and Phone are required",
      });
    }

    const updatedContact = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
    };

    customer.contacts[index] = updatedContact;
    await customer.save();

    res.json(customer);
  } catch (err) {
    console.error("EDIT CONTACT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
