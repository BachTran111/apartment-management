import express from "express";
import request from "supertest";

import hopDongRouter from "../src/routes/hopDong.router.js";

describe("POST /api/contracts - Tao hop dong", () => {
  const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use("/api/contracts", hopDongRouter);
    return app;
  };

  const validPayload = {
    nguoi_thue_id: "507f1f77bcf86cd799439011",
    phong_id: "507f1f77bcf86cd799439012",
    ngay_bat_dau: "2026-05-01",
    ngay_ket_thuc: "2026-12-31",
    tien_dat_coc: 5000000,
    trang_thai: "active",
  };

  it("tao thanh cong voi du lieu hop le", async () => {
    const app = buildApp();

    const res = await request(app).post("/api/contracts").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toMatch(/json/i);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: expect.any(String),
      }),
    );
  });

  it("tra loi loi neu thieu field bat buoc", async () => {
    const app = buildApp();
    const invalidPayload = {
      ...validPayload,
      nguoi_thue_id: undefined,
    };

    const res = await request(app).post("/api/contracts").send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.stringMatching(/(required|bat buoc)/i),
      }),
    );
  });

  it("tra loi loi neu ngay_bat_dau khong nho hon ngay_ket_thuc", async () => {
    const app = buildApp();
    const invalidPayload = {
      ...validPayload,
      ngay_bat_dau: "2027-01-01",
      ngay_ket_thuc: "2026-12-31",
    };

    const res = await request(app).post("/api/contracts").send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.stringMatching(
          /(ngay_bat_dau|start).*(ngay_ket_thuc|end)/i,
        ),
      }),
    );
  });

  it("tra loi loi neu co gia tri am", async () => {
    const app = buildApp();
    const invalidPayload = {
      ...validPayload,
      tien_dat_coc: -1000,
    };

    const res = await request(app).post("/api/contractss").send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.stringMatching(/(am|negative|khong.*am)/i),
      }),
    );
  });
});
