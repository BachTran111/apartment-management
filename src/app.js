import express from "express";
import cors from "cors";
import morgan from "morgan";

// import instanceMongoDB from "./config/db.config.js";
import authRouter from "./routes/auth.route.js";
import phongRouter from "./routes/phong.route.js";
import noithatRouter from "./routes/noithat.route.js";

import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/phongs", phongRouter);
app.use("/api/noithat", noithatRouter);

app.get("/", (req, res) => res.send(" Running..."));

app.use(errorHandler);

(async () => {
  try {
    // await instanceMongoDB();
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
