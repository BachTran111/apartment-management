import ApartmentService from "../services/apartment.service.js";
import { OK } from "../handler/success-response.js";

class ApartmentController {
  search = async (req, res, next) => {
    try {
      const filters = req.query; // { q, minPrice, maxPrice, minArea, status }
      const results = await ApartmentService.searchApartments(filters);
      
      res.status(200).json(new OK({
        message: "Search completed successfully",
        metadata: results
      }));
    } catch (err) {
      res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await ApartmentService.getApartmentById(id);
      if (!result) return res.status(404).json({ status: "NOT_FOUND", message: "Apartment not found" });

      res.status(200).json(new OK({
        message: "Get apartment detail successfully",
        metadata: result
      }));
    } catch (err) {
      res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await ApartmentService.updateApartment(id, data);
        if (!result) return res.status(404).json({ status: "NOT_FOUND", message: "Apartment not found" });

        res.status(200).json(new OK({
            message: "Update apartment successfully",
            metadata: result
        }));
    } catch (err) {
        res.status(500).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new ApartmentController();
