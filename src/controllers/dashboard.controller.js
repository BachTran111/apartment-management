import DashboardService from "../services/dashboard.service.js";
import { OK } from "../handler/success-response.js";

class DashboardController {
  static async getSummary(req, res, next) {
    try {
      const data = await DashboardService.getDashboardData();
      return res.status(200).json(
        new OK({
          message: "Success",
          metadata: data,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
