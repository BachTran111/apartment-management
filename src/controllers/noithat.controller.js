import mongoose from "mongoose";
import NoiThatService from "../services/noithat.service.js";
import { OK } from "../handler/success-response.js";

class NoiThatController {
  getAll = async (req, res) => {
    try {
      const { skip = 0, limit = 50 } = req.query;

      const items = await NoiThatService.getAll(
        {},
        {
          skip: Number(skip),
          limit: Math.min(100, Number(limit)),
        },
      );

      return res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  getById = async (req, res) => {
    try {
      const { noiThatId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(noiThatId)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid noiThatId",
        });
      }

      const item = await NoiThatService.getById(noiThatId);

      if (!item) {
        return res.status(404).json({
          status: "ERROR",
          message: "NoiThat not found",
        });
      }

      return res.status(200).json(new OK({ metadata: item }));
    } catch (err) {
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  create = async (req, res) => {
    try {
      const payload = req.body;

      const item = await NoiThatService.create(payload);

      return res
        .status(201)
        .json(new OK({ message: "NoiThat created", metadata: item }));
    } catch (err) {
      return res.status(400).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  update = async (req, res) => {
    try {
      const { noiThatId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(noiThatId)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid noiThatId",
        });
      }

      const payload = req.body;

      const item = await NoiThatService.update(noiThatId, payload);

      if (!item) {
        return res.status(404).json({
          status: "ERROR",
          message: "NoiThat not found",
        });
      }

      return res
        .status(200)
        .json(new OK({ message: "NoiThat updated", metadata: item }));
    } catch (err) {
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  remove = async (req, res) => {
    try {
      const { noiThatId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(noiThatId)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid noiThatId",
        });
      }

      const removed = await NoiThatService.remove(noiThatId);

      if (!removed) {
        return res.status(404).json({
          status: "ERROR",
          message: "NoiThat not found",
        });
      }

      return res
        .status(200)
        .json(new OK({ message: "NoiThat removed", metadata: removed }));
    } catch (err) {
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  getAllByPhong = async (req, res) => {
    try {
      const { phongId } = req.params;
      const { skip = 0, limit = 100 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(phongId)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid phongId",
        });
      }

      const items = await NoiThatService.getAllByPhong(phongId, {
        skip: Number(skip),
        limit: Math.min(200, Number(limit)),
      });

      return res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };
}

export default new NoiThatController();
