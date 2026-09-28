import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createCloudinaryStorage } from "../config/cloudinary.js";
import City from "../models/City.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads/cities");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = createCloudinaryStorage("blood_donation/cities");

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPG, PNG, WEBP allowed."));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/* ── Image Upload ─────────────── */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }
  const fileUrl = req.file.path;
  res.json({ success: true, fileUrl });
});

/* ── GET /api/cities (Public Active Cities) ── */
router.get("/", async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, count: cities.length, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching cities", error: err.message });
  }
});

/* ── GET /api/cities/states (Public Unique States from Cities) ── */
router.get("/states", async (req, res) => {
  try {
    const cities = await City.find({ state: { $exists: true, $ne: "" } })
      .select("state")
      .lean();
    
    const seen = new Set();
    const uniqueStates = [];

    for (const item of cities) {
      if (!item.state || typeof item.state !== "string") continue;
      const trimmed = item.state.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seen.has(lower)) {
        seen.add(lower);
        uniqueStates.push(trimmed);
      }
    }

    uniqueStates.sort((a, b) => a.localeCompare(b));
    res.json({ success: true, count: uniqueStates.length, data: uniqueStates });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching states", error: err.message });
  }
});

/* ── GET /api/cities/admin/all (Admin All Cities) ── */
router.get("/admin/all", verifyToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: new RegExp(search.trim(), "i") },
        { state: new RegExp(search.trim(), "i") },
      ];
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const cities = await City.find(filter).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, total: cities.length, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching cities", error: err.message });
  }
});

/* ── DELETE /api/cities/admin/clear-all (Clear all cities) ── */
router.delete("/admin/clear-all", verifyToken, async (req, res) => {
  try {
    const result = await City.deleteMany({});
    res.json({ success: true, message: `All ${result.deletedCount} cities cleared successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error clearing cities", error: err.message });
  }
});

/* ── POST /api/cities (Create City) ── */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, state, imageUrl, displayOrder, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "City Name is required." });
    }

    const existing = await City.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
    if (existing) {
      return res.status(400).json({ success: false, message: "This city already exists." });
    }

    const city = new City({
      name: name.trim(),
      state: state ? state.trim() : "",
      imageUrl: imageUrl || "",
      displayOrder: displayOrder !== undefined && displayOrder !== "" ? Number(displayOrder) : 99,
      isActive: isActive !== undefined ? (isActive === true || isActive === "true") : true,
    });

    await city.save();
    res.status(201).json({ success: true, message: "City created successfully!", data: city });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating city", error: err.message });
  }
});

/* ── PUT /api/cities/:id (Update City) ── */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, state, imageUrl, displayOrder, isActive } = req.body;

    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found." });
    }

    if (name && name.trim()) {
      // Check duplicate name
      const duplicate = await City.findOne({
        _id: { $ne: city._id },
        name: new RegExp(`^${name.trim()}$`, "i"),
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "Another city with this name already exists." });
      }
      city.name = name.trim();
    }

    if (state !== undefined) city.state = state.trim();
    if (imageUrl !== undefined) city.imageUrl = imageUrl;
    if (displayOrder !== undefined && displayOrder !== "") city.displayOrder = Number(displayOrder);
    if (isActive !== undefined) city.isActive = isActive === true || isActive === "true";

    await city.save();
    res.json({ success: true, message: "City updated successfully!", data: city });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating city", error: err.message });
  }
});

/* ── PATCH /api/cities/:id/toggle-status ── */
router.patch("/:id/toggle-status", verifyToken, async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found." });
    }

    city.isActive = !city.isActive;
    await city.save();

    res.json({
      success: true,
      message: `City marked as ${city.isActive ? "Active" : "Inactive"}`,
      data: city,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error toggling city status", error: err.message });
  }
});

/* ── DELETE /api/cities/:id ── */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found." });
    }
    res.json({ success: true, message: "City deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting city", error: err.message });
  }
});

export default router;
