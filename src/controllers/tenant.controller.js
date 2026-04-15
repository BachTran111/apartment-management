import TenantService from "../services/tenant.service.js";
import { OK } from "../handler/success-response.js";
import { validateCreateTenant, validateUpdateTenant } from "../dto/tenant.dto.js";

class TenantController {
  create = async (req, res) => {
    try {
      const errors = validateCreateTenant(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ status: "ERROR", message: errors.join(", ") });
      }

      const files = req.files || [];
      const result = await TenantService.createTenant(req.body, files);

      res.status(201).json(new OK({ message: "Tenant created successfully", metadata: result }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const errors = validateUpdateTenant(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ status: "ERROR", message: errors.join(", ") });
      }

      const files = req.files || [];
      const result = await TenantService.updateTenant(id, req.body, files);

      res.status(200).json(new OK({ message: "Tenant updated successfully", metadata: result }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await TenantService.deleteTenant(id);

      res.status(200).json(new OK({ message: result.message }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  removeImage = async (req, res) => {
    try {
      const { id } = req.params;
      const { imagePath, imageType } = req.body;

      const result = await TenantService.removeTenantImage(id, imagePath, imageType);

      res.status(200).json(new OK({ message: result.message }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new TenantController();