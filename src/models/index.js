import { createRequire } from "module";

const require = createRequire(import.meta.url);
const models = require("../models/model.cjs");

export const { CanHo, NguoiThue, HopDong, HoaDon, QuanTriVien } = models;
