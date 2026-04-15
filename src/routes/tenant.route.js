import express from "express";
import TenantController from "../controllers/tenant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadTenantImages } from "../config/multer.config.js";

const router = express.Router();

router.post("/", authMiddleware, uploadTenantImages, TenantController.create);
router.put("/:id", authMiddleware, uploadTenantImages, TenantController.update);
router.delete("/:id", authMiddleware, TenantController.delete);
router.delete("/:id/image", authMiddleware, TenantController.removeImage);

export default router;