import express from "express";
import cors from "cors";
import morgan from "morgan";

import instanceMongoDB from "./configs/db.config.js";
import roomRouter from "./routes/room.route.js"; // Đã cập nhật tên file theo chuẩn
import apartmentRouter from "./routes/apartment.route.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));

// ==========================================
// ROUTES
// ==========================================
// Chỉ giữ lại module Room. Bạn có thể dùng "/api/rooms" hoặc "/api/phongs" tùy ý.
app.use("/api/rooms", roomRouter);
app.use("/api/apartments", apartmentRouter);

// ==========================================
// ERROR HANDLING
// ==========================================
// Middleware xử lý lỗi luôn phải đặt ở cuối cùng sau các routes
app.use(errorHandler);

// ==========================================
// BOOTSTRAP
// ==========================================
(async () => {
  try {
    // Đảm bảo kết nối DB thành công trước khi mở port nhận request
    await instanceMongoDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
      console.log(`👉 Room API: http://0.0.0.0:${PORT}/api/rooms`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

export default app;
