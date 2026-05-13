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

/**
 * @swagger
 * /api/hop-dong:
 *   post:
 *     summary: Tạo hợp đồng mới
 *     description: Tạo hợp đồng thuê căn hộ mới với thông tin người thuê, phòng, ngày bắt đầu, ngày kết thúc và tiền đặt cọc
 *     tags:
 *       - Contracts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nguoi_thue_id
 *               - phong_id
 *               - ngay_bat_dau
 *               - ngay_ket_thuc
 *             properties:
 *               nguoi_thue_id:
 *                 type: string
 *                 description: ID của người thuê (MongoDB ObjectId)
 *                 example: "507f1f77bcf86cd799439011"
 *               phong_id:
 *                 type: string
 *                 description: ID của phòng (MongoDB ObjectId)
 *                 example: "507f1f77bcf86cd799439012"
 *               ngay_bat_dau:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu hợp đồng (định dạng YYYY-MM-DD)
 *                 example: "2026-05-01"
 *               ngay_ket_thuc:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc hợp đồng (phải sau ngày bắt đầu, định dạng YYYY-MM-DD)
 *                 example: "2026-12-31"
 *               tien_dat_coc:
 *                 type: number
 *                 description: Số tiền đặt cọc (không được âm)
 *                 example: 5000000
 *               trang_thai:
 *                 type: string
 *                 enum: [active, expired]
 *                 description: Trạng thái hợp đồng
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Hợp đồng được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Contract created successfully"
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     nguoi_thue_id:
 *                       type: string
 *                     phong_id:
 *                       type: string
 *                     ngay_bat_dau:
 *                       type: string
 *                     ngay_ket_thuc:
 *                       type: string
 *                     tien_dat_coc:
 *                       type: number
 *                     trang_thai:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "nguoi_thue_id is required"
 *                     - "ngay_bat_dau must be before ngay_ket_thuc"
 *                     - "tien_dat_coc cannot be negative"
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

// POST, PUT, DELETE - Sẽ thêm middleware sau

router.post("/", HopDongController.createContract);
// router.put("/:id", HopDongController.updateContract);
// router.delete("/:id", HopDongController.deleteContract);

/**
 * @swagger
 * /api/hop-dong/{id}/terminate:
 *   post:
 *     summary: Thanh lý hợp đồng
 *     description: Thanh lý một hợp đồng hiện có, cập nhật trạng thái và ghi nhận chi phí phát sinh
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng cần thanh lý (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ngay_thanh_ly
 *               - chi_phi_phat_sinh
 *             properties:
 *               ngay_thanh_ly:
 *                 type: string
 *                 format: date
 *                 description: Ngày thanh lý hợp đồng (định dạng YYYY-MM-DD, phải trong quá khứ, giữa ngay_bat_dau và ngay_ket_thuc)
 *                 example: "2026-09-15"
 *               chi_phi_phat_sinh:
 *                 type: number
 *                 description: Tổng chi phí phát sinh (điện, nước, sửa chữa, etc - không được âm)
 *                 example: 500000
 *               ghi_chu:
 *                 type: string
 *                 description: Ghi chú thêm về thanh lý hợp đồng (tuỳ chọn)
 *                 example: "Chi phí sửa chữa do hỏng hóc"
 *     responses:
 *       200:
 *         description: Hợp đồng đã thanh lý thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Hợp đồng thanh lý thành công"
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     nguoi_thue_id:
 *                       type: string
 *                     phong_id:
 *                       type: string
 *                     ngay_bat_dau:
 *                       type: string
 *                     ngay_ket_thuc:
 *                       type: string
 *                     ngay_thanh_ly:
 *                       type: string
 *                     chi_phi_phat_sinh:
 *                       type: number
 *                     trang_thai:
 *                       type: string
 *                       example: "terminated"
 *                     ghi_chu:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc hợp đồng không thể thanh lý
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "ngay_thanh_ly is required"
 *                     - "ngay_thanh_ly không thể là ngày trong tương lai"
 *                     - "Hợp đồng đã thanh lý trước đó"
 *                     - "chi_phi_phat_sinh không thể là giá trị âm"
 *       404:
 *         description: Hợp đồng không được tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Hợp đồng không được tìm thấy"
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/:id/terminate", HopDongController.terminateContract);

export default router;
