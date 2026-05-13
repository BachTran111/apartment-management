import request from "supertest";
import app from "../app.js";

describe("Thanh lý hợp đồng API - POST /api/hop-dong/:id/terminate", () => {
  const validContractId = "507f1f77bcf86cd799439011";

  describe("Thanh lý thành công với dữ liệu hợp lệ", () => {
    it("trả về status 200 và hợp đồng với trạng thái 'terminated'", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-10-15",
        chi_phi_phat_sinh: 0,
        ghi_chu: "Kết thúc hợp đồng bình thường",
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.status).toBe("OK");
      expect(response.body.message).toMatch(/(thanh lý|terminate|kết thúc)/i);
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.trang_thai).toBe("terminated");
      expect(response.body.metadata.ngay_thanh_ly).toBeDefined();
    });

    it("trả về tổng chi phí phát sinh trong response", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-09-20",
        chi_phi_phat_sinh: 500000,
        ghi_chu: "Chi phí sửa chữa",
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.metadata.chi_phi_phat_sinh).toBe(500000);
    });
  });

  describe("Tính đúng chi phí phát sinh", () => {
    it("chi phí phát sinh phải >= 0", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-08-10",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.metadata.chi_phi_phat_sinh).toBe(0);
      expect(response.body.metadata.chi_phi_phat_sinh).toBeGreaterThanOrEqual(
        0,
      );
    });

    it("chi phí phát sinh có thể là số nguyên hoặc số thập phân", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-07-05",
        chi_phi_phat_sinh: 1250000.5,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.metadata.chi_phi_phat_sinh).toBe(1250000.5);
    });

    it("trả lỗi nếu chi phí phát sinh âm", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-06-15",
        chi_phi_phat_sinh: -100000,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(
        /(chi phí|âm|negative|cannot be negative)/i,
      );
    });
  });

  describe("Cập nhật trạng thái hợp đồng thành 'terminated'", () => {
    it("trạng thái phải thay đổi thành 'terminated'", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-11-30",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.metadata.trang_thai).toBe("terminated");
      expect(response.body.metadata.trang_thai).not.toBe("active");
      expect(response.body.metadata.trang_thai).not.toBe("expired");
    });

    it("ngay_thanh_ly phải được lưu", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-10-25",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.metadata.ngay_thanh_ly).toBeDefined();
      expect(new Date(response.body.metadata.ngay_thanh_ly)).toEqual(
        new Date(terminationData.ngay_thanh_ly),
      );
    });
  });

  describe("Lỗi nếu hợp đồng đã thanh lý trước đó", () => {
    it("trả lỗi 400 nếu hợp đồng đã có trạng thái 'terminated'", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-09-15",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(
        /(đã thanh lý|already terminated|already finalized)/i,
      );
    });

    it("pesan lỗi phải rõ ràng rằng hợp đồng đã được thanh lý", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-08-20",
        chi_phi_phat_sinh: 250000,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.message.length).toBeGreaterThan(0);
      expect(response.body.message.toLowerCase()).toMatch(
        /terminate|thanh lý|finali/,
      );
    });
  });

  describe("Lỗi nếu ngày thanh lý không hợp lệ", () => {
    it("trả lỗi 400 nếu ngay_thanh_ly trước ngay_bat_dau", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-03-01",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(
        /(ngay_thanh_ly|termination date|trước|before)/i,
      );
    });

    it("trả lỗi 400 nếu ngay_thanh_ly sau ngay_ket_thuc", async () => {
      const terminationData = {
        ngay_thanh_ly: "2027-01-15",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(
        /(ngay_thanh_ly|termination date|sau|after|vượt quá)/i,
      );
    });

    it("trả lỗi 400 nếu thiếu field ngay_thanh_ly", async () => {
      const terminationData = {
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(
        /(ngay_thanh_ly|required|bắt buộc)/i,
      );
    });

    it("trả lỗi 400 nếu định dạng ngay_thanh_ly không hợp lệ", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-13-45", // invalid month and day
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(/định dạng|format|invalid/i);
    });

    it("trả lỗi 400 nếu ngay_thanh_ly là ngày trong tương lai (quá hôm nay)", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split("T")[0];

      const terminationData = {
        ngay_thanh_ly: futureDate,
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(
        /(tương lai|future|hôm nay|today)/i,
      );
    });
  });

  describe("Edge cases và validation", () => {
    it("trả lỗi 400 nếu contract ID không hợp lệ", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-09-10",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/invalid-id/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
    });

    it("trả lỗi 404 nếu hợp đồng không tồn tại", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-09-10",
        chi_phi_phat_sinh: 0,
      };

      const response = await request(app)
        .post(`/api/hop-dong/507f1f77bcf86cd799439999/terminate`)
        .send(terminationData)
        .expect(404);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(/không tìm thấy|not found/i);
    });

    it("trả lỗi 400 nếu payload không hợp lệ (không phải JSON object)", async () => {
      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send("invalid string payload")
        .expect(400);

      expect(response.body.status).toBe("ERROR");
    });

    it("trả lỗi 400 nếu chi_phi_phat_sinh không phải số", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-09-10",
        chi_phi_phat_sinh: "five hundred thousand",
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(400);

      expect(response.body.status).toBe("ERROR");
      expect(response.body.message).toMatch(/chi phí|số|number|invalid/i);
    });

    it("accept ghi_chu field (optional)", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-09-15",
        chi_phi_phat_sinh: 0,
        ghi_chu: "Thanh lý sớm do người thuê xin",
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.metadata.ghi_chu).toBe(
        "Thanh lý sớm do người thuê xin",
      );
    });
  });

  describe("Response structure", () => {
    it("trả về response với structure đúng khi thành công", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-10-10",
        chi_phi_phat_sinh: 100000,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("metadata");
      expect(response.body.status).toBe("OK");
      expect(typeof response.body.message).toBe("string");
      expect(typeof response.body.metadata).toBe("object");
    });

    it("metadata phải chứa đầy đủ thông tin hợp đồng", async () => {
      const terminationData = {
        ngay_thanh_ly: "2026-09-20",
        chi_phi_phat_sinh: 250000,
      };

      const response = await request(app)
        .post(`/api/hop-dong/${validContractId}/terminate`)
        .send(terminationData)
        .expect(200);

      expect(response.body.metadata._id).toBeDefined();
      expect(response.body.metadata.nguoi_thue_id).toBeDefined();
      expect(response.body.metadata.phong_id).toBeDefined();
      expect(response.body.metadata.ngay_bat_dau).toBeDefined();
      expect(response.body.metadata.ngay_ket_thuc).toBeDefined();
      expect(response.body.metadata.ngay_thanh_ly).toBeDefined();
      expect(response.body.metadata.chi_phi_phat_sinh).toBeDefined();
      expect(response.body.metadata.trang_thai).toBe("terminated");
    });
  });
});
