import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { QuanTriVien as UserModel } from "../models/index.js";

const SECRET = "super_secret_key";

class AuthService {
  async register(username, password, role = "USER") {
    if (await UserModel.exists({ ten_dang_nhap: username }))
      throw new Error("Username already exists");
    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ ten_dang_nhap: username, mat_khau: hashed });
    return { id: user._id, username: user.ten_dang_nhap };
  }

  async login(username, password) {
    const user = await UserModel.findOne({ ten_dang_nhap: username });
    if (!user) throw new Error("Invalid username or password");
    const valid = await bcrypt.compare(password, user.mat_khau);
    if (!valid) throw new Error("Invalid username or password");
    const token = jwt.sign({ id: user._id }, SECRET, {
      expiresIn: "1h",
    });
    return { token };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, SECRET);
    } catch {
      throw new Error("Invalid or expired token");
    }
  }
}

export default new AuthService();
