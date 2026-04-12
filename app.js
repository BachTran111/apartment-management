import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import instanceMongoDB from "./src/config/db.config.js";
// import authRouter from "./src/routes/auth.route.js";

import { errorHandler } from "./src/middlewares/error-handler.js";
import hopDongRouter from "./src/routes/hopDong.router.js";

const app = express();

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Apartment Management API",
      version: "1.0.0",
      description: "API quản lý hợp đồng cho thuê căn hộ",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));

// Serve static files (HTML, CSS, JS) from views folder
app.use(express.static("views"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use("/api/auth", authRouter);
app.use("/api/hop-dong", hopDongRouter);
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
