import jwt from "jsonwebtoken";

const SECRET = "super_secret_key";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "ERROR",
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // Lưu user info vào req
    next();
  } catch (err) {
    res.status(403).json({
      status: "ERROR",
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "ERROR",
        message: "Access denied",
      });
    }

    next();
  };
};
