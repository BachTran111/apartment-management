import NoiThatService from "../services/noithat.service.js";
import { OK } from "../handler/success-response.js";

class NoiThatController {
  getAll = async (req, res, next) => {
    try {
      const { skip, limit } = req.query;
      const items = await NoiThatService.getAll(
        {},
        { skip: Number(skip) || 0, limit: Number(limit) || 50 },
      );
      res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await NoiThatService.getById(id);
      if (!item)
        return res
          .status(404)
          .json({ status: "ERROR", message: "NoiThat not found" });
      res.status(200).json(new OK({ metadata: item }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  create = async (req, res, next) => {
    try {
      const payload = req.body;
      const item = await NoiThatService.create(payload);
      res
        .status(201)
        .json(new OK({ message: "NoiThat created", metadata: item }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const item = await NoiThatService.update(id, payload);
      if (!item)
        return res
          .status(404)
          .json({ status: "ERROR", message: "NoiThat not found" });
      res
        .status(200)
        .json(new OK({ message: "NoiThat updated", metadata: item }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      const removed = await NoiThatService.remove(id);
      if (!removed)
        return res
          .status(404)
          .json({ status: "ERROR", message: "NoiThat not found" });
      res
        .status(200)
        .json(new OK({ message: "NoiThat removed", metadata: removed }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  // Get all furniture for a given room
  getAllByPhong = async (req, res, next) => {
    try {
      const { id } = req.params; // phong identifier
      const { skip, limit } = req.query;
      const items = await NoiThatService.getAllByPhong(id, {
        skip: Number(skip) || 0,
        limit: Number(limit) || 100,
      });
      res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new NoiThatController();
