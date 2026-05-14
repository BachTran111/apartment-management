import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', DashboardController.getSummary);

export default router;