import express from "express";
import * as tenantController from "../controllers/tenant.controller.js";

const router = express.Router();

// GET endpoints only
router.get("/", tenantController.getAllTenants);
router.get("/search", tenantController.searchTenants);
router.get("/:id", tenantController.getTenantById);

export default router;
