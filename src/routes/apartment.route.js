import express from "express";
import ApartmentController from "../controllers/apartment.controller.js";

const router = express.Router();

// GET /api/apartments/search?q=...&minPrice=...&maxPrice=...&minArea=...&status=...
router.get("/search", ApartmentController.search);
router.get("/:id", ApartmentController.getById);
router.put("/:id", ApartmentController.update);

export default router;
