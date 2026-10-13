import express from "express";
import Supplier from "../models/Supplier.js";

const router = express.Router();

// CREATE Supplier
router.post("/", async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

// READ All Suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

// UPDATE Supplier
router.put("/:id", async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

// DELETE Supplier
router.delete("/:id", async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ msg: "Supplier not found" });

  supplier.status = supplier.status === "Active" ? "Inactive" : "Active";
  await supplier.save();
  res.json({ msg: `Supplier status changed to ${supplier.status}` });
});

export default router;
