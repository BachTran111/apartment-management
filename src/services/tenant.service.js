import Contract from "../models/contract.model.js";
import Tenant from "../models/tenant.model.js";

class TenantService {
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    const [tenants, total] = await Promise.all([
      Tenant.find(filter).skip(skip).limit(limit).sort(sort).lean(),
      Tenant.countDocuments(filter),
    ]);

    const enrichedTenants = await this.attachContractData(tenants);

    return {
      tenants: enrichedTenants,
      total,
    };
  }

  async getById(id) {
    if (!id) return null;

    const tenant = await Tenant.findById(id).lean();
    if (!tenant) return null;

    const [enrichedTenant] = await this.attachContractData([tenant]);
    return enrichedTenant || null;
  }

  async search(
    searchQuery,
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    const filter = {
      $or: [
        { ho_ten: { $regex: searchQuery, $options: "i" } },
        { so_dien_thoai: { $regex: searchQuery, $options: "i" } },
        { cmnd_cccd: { $regex: searchQuery, $options: "i" } },
      ],
    };

    return this.getAll(filter, { skip, limit, sort });
  }

  async getByStatus(trang_thai, { skip = 0, limit = 50 } = {}) {
    return this.getAll({ trang_thai }, { skip, limit });
  }

  async create(data) {
    const doc = await Tenant.create(this.sanitizeTenantPayload(data));
    return doc.toObject();
  }

  async update(id, updateData) {
    return Tenant.findByIdAndUpdate(id, this.sanitizeTenantPayload(updateData), {
      new: true,
    }).lean();
  }

  async remove(id) {
    return Tenant.findByIdAndDelete(id).lean();
  }

  sanitizeTenantPayload(data = {}) {
    const allowedFields = [
      "ho_ten",
      "tuoi",
      "cmnd_cccd",
      "que_quan",
      "so_dien_thoai",
      "anh_dai_dien",
      "lien_he_khan_cap",
      "anh_hop_dong",
      "trang_thai",
      "email",
      "nghe_nghiep",
      "dien_thoai_khan_cap",
      "quan_he",
      "moi_quan_he",
      "ho_than",
    ];

    return Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key)),
    );
  }

  async attachContractData(tenants = []) {
    if (!Array.isArray(tenants) || tenants.length === 0) {
      return [];
    }

    const tenantIds = tenants.map((tenant) => tenant?._id).filter(Boolean);
    if (!tenantIds.length) {
      return tenants;
    }

    const contracts = await Contract.find({
      nguoi_thue_id: { $in: tenantIds },
    })
      .populate({
        path: "phong_id",
        select: "so_phong gia can_ho_id",
        populate: {
          path: "can_ho_id",
          select: "ten dia_chi",
        },
      })
      .lean();

    const contractsByTenantId = new Map(
      tenantIds.map((tenantId) => [String(tenantId), []]),
    );

    contracts.forEach((contract) => {
      const tenantId = String(contract.nguoi_thue_id || "");
      if (!tenantId) {
        return;
      }

      const bucket = contractsByTenantId.get(tenantId) || [];
      bucket.push(contract);
      contractsByTenantId.set(tenantId, bucket);
    });

    return tenants.map((tenant) => {
      const tenantContracts = this.sortContractsByPriority(
        contractsByTenantId.get(String(tenant._id)) || [],
      );
      const currentContract = tenantContracts[0] || null;
      const currentRoom = currentContract?.phong_id || null;

      return {
        ...tenant,
        phong_id: currentRoom,
        ngay_bat_dau: currentContract?.ngay_bat_dau || null,
        ngay_ket_thuc: currentContract?.ngay_ket_thuc || null,
        tien_phong: currentRoom?.gia ?? null,
        current_contract: currentContract,
        contract_status: this.deriveTenantContractStatus(currentContract),
        trang_thai: this.deriveTenantContractStatus(
          currentContract,
          tenant.trang_thai,
        ),
      };
    });
  }

  deriveTenantContractStatus(contract, fallback = "inactive") {
    if (!contract) {
      return fallback;
    }

    if (contract.trang_thai === "terminated") {
      return "inactive";
    }

    const endDate = new Date(contract.ngay_ket_thuc || 0);
    const now = new Date();

    if (!Number.isNaN(endDate.getTime())) {
      if (endDate < now) {
        return "expired";
      }

      const remainingDays = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (remainingDays <= 30) {
        return "expiring";
      }
    }

    return contract.trang_thai === "active" ? "active" : fallback;
  }

  sortContractsByPriority(contracts = []) {
    const statusPriority = {
      active: 0,
      expired: 1,
      terminated: 2,
    };

    return [...contracts].sort((left, right) => {
      const leftPriority = statusPriority[left?.trang_thai] ?? 99;
      const rightPriority = statusPriority[right?.trang_thai] ?? 99;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return (
        new Date(right?.ngay_bat_dau || 0).getTime() -
        new Date(left?.ngay_bat_dau || 0).getTime()
      );
    });
  }
}

export default new TenantService();
