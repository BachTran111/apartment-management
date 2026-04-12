import express from "express";
import HopDongController from "../controllers/hopDong.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/hop-dong:
 *   get:
 *     summary: Lấy danh sách tất cả hợp đồng
 *     description: Lấy danh sách hợp đồng với hỗ trợ phân trang, sắp xếp và lọc
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi trên mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên người thuê hoặc số phòng
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired]
 *         description: Lọc theo trạng thái hợp đồng
 *     responses:
 *       200:
 *         description: Danh sách hợp đồng được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", HopDongController.getAllContracts);

/**
 * @swagger
 * /api/hop-dong/stats:
 *   get:
 *     summary: Lấy thống kê hợp đồng
 *     description: Lấy thống kê tổng số hợp đồng, hợp đồng đang hoạt động, hợp đồng sắp hết hạn
 *     tags:
 *       - Statistics
 *     responses:
 *       200:
 *         description: Thống kê được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 data:
 *                   type: object
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/stats", HopDongController.getStatistics);

/**
 * @swagger
 * /api/hop-dong/expiring:
 *   get:
 *     summary: Lấy danh sách hợp đồng sắp hết hạn
 *     description: Lấy danh sách hợp đồng sẽ hết hạn trong 30 ngày tới
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 data:
 *                   type: array
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/expiring", HopDongController.getExpiringContracts);

/**
 * @swagger
 * /api/hop-dong/status/{status}:
 *   get:
 *     summary: Lấy hợp đồng theo trạng thái
 *     description: Lấy tất cả hợp đồng có trạng thái cụ thể (active hoặc expired)
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, expired]
 *         description: Trạng thái hợp đồng
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 data:
 *                   type: array
 *       400:
 *         description: Trạng thái không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/status/:status", HopDongController.getContractsByStatus);

// POST, PUT, DELETE - Sẽ thêm middleware sau
// router.post("/", HopDongController.createContract);
// router.put("/:id", HopDongController.updateContract);
// router.delete("/:id", HopDongController.deleteContract);

export default router;
