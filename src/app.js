import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";

import instanceMongoDB from "./configs/db.config.js";
import roomRouter from "./routes/room.route.js"; // Đã cập nhật tên file theo chuẩn
import apartmentRouter from "./routes/apartment.route.js";
import contractRouter from "./routes/contract.route.js";
import tenantRouter from "./routes/tenant.route.js";
import billRouter from "./routes/bill.route.js";
import interiorRouter from "./routes/interior.route.js";
import { errorHandler } from "./middlewares/error-handler.js";
import dashboardRoute from './routes/dashboard.route.js';

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.static(path.resolve("views")));

app.get("/", (_req, res) => {
  res.sendFile(path.resolve("views/dashboard/Dashboard.html"));
});

app.use("/api/rooms", roomRouter);
app.use("/api/apartments", apartmentRouter);
app.use("/api/contracts", contractRouter);
app.use("/api/tenants", tenantRouter);
app.use("/api/bills", billRouter);
app.use("/api/interiors", interiorRouter);
app.use("/api/noithat", interiorRouter);
app.use('/api/dashboard', dashboardRoute);

app.use(errorHandler);

(async () => {
  try {
    await instanceMongoDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(` Server is running on http://0.0.0.0:${PORT}`);
      console.log(` Room API: http://0.0.0.0:${PORT}/api/rooms`);
    });
  } catch (err) {
    console.error(" Failed to start server:", err);
    process.exit(1);
  }
})();

export default app;
