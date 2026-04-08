import AuthService from "../services/auth.service.js";
import { OK } from "../handler/success-response.js";

class AuthController {
  register = async (req, res, next) => {
    try {
      const { username, password, role } = req.body;
      const user = await AuthService.register(username, password, role);
      res
        .status(201)
        .json(new OK({ message: "User registered", metadata: user }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  login = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const { token, role } = await AuthService.login(username, password);
      res
        .status(200)
        .json(
          new OK({ message: "Login successful", metadata: { token, role } }),
        );
    } catch (err) {
      res.status(401).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new AuthController();
