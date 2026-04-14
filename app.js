import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";

import instanceMongoDB from "./src/config/db.config.js";
import authRouter from "./src/routes/auth.route.js";
import apartmentRouter from "./src/routes/apartment.route.js";

import { errorHandler } from "./src/middlewares/error-handler.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/apartments", apartmentRouter);

app.use(express.static("views"));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "views", "apartment-list.html"));
});

app.use(errorHandler);

(async () => {
  try {
    await instanceMongoDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "localhost", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

export default app;
