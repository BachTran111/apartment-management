import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const SECRET = process.env.JWT_SECRET || "super_secret_key";
const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Validate email format
   */
  validateEmail(email) {
    if (!email || typeof email !== "string") {
      throw new Error("Email is required");
    }
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error("Invalid email format");
    }
    return trimmed;
  }

  /**
   * Validate full name
   */
  validateFullName(fullName) {
    if (!fullName || typeof fullName !== "string") {
      throw new Error("Full name is required");
    }
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      throw new Error("Full name must be at least 2 characters");
    }
    if (trimmed.length > 100) {
      throw new Error("Full name must not exceed 100 characters");
    }
    return trimmed;
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    if (!password || typeof password !== "string") {
      throw new Error("Password is required");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    if (password.length > 100) {
      throw new Error("Password must not exceed 100 characters");
    }
    return password;
  }

  /**
   * Register new user
   */
  async register(email, password, fullName) {
    try {
      // Validate inputs
      const validatedEmail = this.validateEmail(email);
      const validatedPassword = this.validatePassword(password);
      const validatedFullName = this.validateFullName(fullName);

      // Check if email already exists
      const existingUser = await UserModel.findOne({
        email: validatedEmail,
      });
      if (existingUser) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedPassword, SALT_ROUNDS);

      // Create user
      const user = await UserModel.create({
        email: validatedEmail,
        password: hashedPassword,
        fullName: validatedFullName,
      });

      return {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      };
    } catch (err) {
      throw new Error(err.message || "Registration failed");
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Validate inputs
      const validatedEmail = this.validateEmail(email);
      const validatedPassword = this.validatePassword(password);

      // Find user by email
      const user = await UserModel.findOne({ email: validatedEmail });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Compare passwords
      const isValidPassword = await bcrypt.compare(
        validatedPassword,
        user.password,
      );
      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, fullName: user.fullName },
        SECRET,
        { expiresIn: "24h" },
      );

      return {
        token,
        email: user.email,
        fullName: user.fullName,
      };
    } catch (err) {
      throw new Error(err.message || "Login failed");
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      if (!token) {
        throw new Error("Token is required");
      }
      return jwt.verify(token, SECRET);
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  }
}

export default new AuthService();
