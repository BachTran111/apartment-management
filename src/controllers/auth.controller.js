import AuthService from "../services/auth.service.js";
import { OK } from "../handler/success-response.js";

class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  register = async (req, res, next) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          status: "ERROR",
          message: "Email, password, and full name are required",
        });
      }

      const user = await AuthService.register(email, password, fullName);
      res
        .status(201)
        .json(
          new OK({ message: "User registered successfully", metadata: user }),
        );
    } catch (err) {
      res.status(400).json({
        status: "ERROR",
        message: err.message || "Registration failed",
      });
    }
  };

  /**
   * Login user
   * @route POST /api/auth/login
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: "ERROR",
          message: "Email and password are required",
        });
      }

      const result = await AuthService.login(email, password);
      res.status(200).json(
        new OK({
          message: "Login successful",
          metadata: {
            token: result.token,
            email: result.email,
            fullName: result.fullName,
          },
        }),
      );
    } catch (err) {
      res.status(401).json({
        status: "ERROR",
        message: err.message || "Login failed",
      });
    }
  };

  /**
   * Get current user info (requires authentication)
   * @route GET /api/auth/me
   */
  getCurrentUser = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "ERROR",
          message: "Authentication required",
        });
      }

      res.status(200).json(
        new OK({
          message: "User information retrieved",
          metadata: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
          },
        }),
      );
    } catch (err) {
      res.status(500).json({
        status: "ERROR",
        message: err.message || "Failed to retrieve user information",
      });
    }
  };

  /**
   * Verify token
   * @route POST /api/auth/verify
   */
  verifyToken = async (req, res, next) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          status: "ERROR",
          message: "Token is required",
        });
      }

      const decoded = AuthService.verifyToken(token);
      res.status(200).json(
        new OK({
          message: "Token is valid",
          metadata: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
          },
        }),
      );
    } catch (err) {
      res.status(401).json({
        status: "ERROR",
        message: err.message || "Token verification failed",
      });
    }
  };
}

export default new AuthController();
