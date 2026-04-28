import express from "express";
import cors from "cors";
import morgan from "morgan";
import fileUpload from "express-fileupload";

import instanceMongoDB from "./src/config/db.config.js";
import tenantRouter from "./src/routes/tenant.route.js";
import roomRouter from "./src/routes/room.route.js";

import { errorHandler } from "./src/middlewares/error-handler.js";

const app = express();

app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:8080', 'http://localhost:8080', 'file://'],
  credentials: true
}));
app.use(morgan("dev"));

// Serve static files từ thư mục views
app.use(express.static('views'));

app.use("/api/tenants", tenantRouter);
app.use("/api/rooms", roomRouter);

app.get("/", (req, res) => res.send(" Running..."));

app.use(errorHandler);

(async () => {
  try {
    await instanceMongoDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

export default app;
