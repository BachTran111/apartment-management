import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const SECRET = "super_secret_key";

class AuthService {
  async register(username, password, role = "USER") {
    if (await UserModel.exists({ username }))
      throw new Error("Username already exists");
    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, password: hashed, role });
    return { id: user._id, username: user.username, role: user.role };
  }

  async login(username, password) {
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error("Invalid username or password");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid username or password");
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, {
      expiresIn: "1h",
    });
    return { token, role: user.role };
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
