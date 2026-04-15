import express from "express";
import * as tenantController from "../controllers/tenant.controller.js";

const router = express.Router();

// CRUD endpoints
router.post("/", tenantController.createTenant);
router.get("/", tenantController.getAllTenants);
router.get("/search", tenantController.searchTenants);
router.get("/:id", tenantController.getTenantById);
router.put("/:id", tenantController.updateTenant);
router.delete("/:id", tenantController.deleteTenant);

export default router;
