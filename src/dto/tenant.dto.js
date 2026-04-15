const createTenantSchema = {
  ho_ten: { type: "string", required: true, min: 2, max: 100 },
  so_dien_thoai: { type: "string", required: true, pattern: /^[0-9]{10,11}$/ },
  email: { type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  cmnd_cccd: { type: "string" },
  ngay_sinh: { type: "date" },
  que_quan: { type: "string" },
  ghi_chu: { type: "string" },
  phong_id: { type: "string", required: true },
  ngay_bat_dau: { type: "date", required: true },
  ngay_ket_thuc: { type: "date" },
  tien_dat_coc: { type: "number", min: 0 },
};

const updateTenantSchema = {
  ho_ten: { type: "string", min: 2, max: 100 },
  so_dien_thoai: { type: "string", pattern: /^[0-9]{10,11}$/ },
  email: { type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  cmnd_cccd: { type: "string" },
  ngay_sinh: { type: "date" },
  que_quan: { type: "string" },
  ghi_chu: { type: "string" },
  phong_id: { type: "string" },
  tien_dat_coc: { type: "number", min: 0 },
  ngay_ket_thuc: { type: "date" },
};

function validateField(value, rules, fieldName) {
  if (value === undefined || value === null) return null;

  if (rules.type === "string") {
    if (typeof value !== "string") {
      return `${fieldName} must be a string`;
    }
    if (rules.min && value.length < rules.min) {
      return `${fieldName} must be at least ${rules.min} characters`;
    }
    if (rules.max && value.length > rules.max) {
      return `${fieldName} must be at most ${rules.max} characters`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
  }

  if (rules.type === "number") {
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a number`;
    }
    if (rules.min !== undefined && num < rules.min) {
      return `${fieldName} must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && num > rules.max) {
      return `${fieldName} must be at most ${rules.max}`;
    }
  }

  if (rules.type === "date") {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} must be a valid date`;
    }
  }

  return null;
}

function validate(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null && value !== "") {
      const error = validateField(value, rules, field);
      if (error) errors.push(error);
    }
  }

  return errors;
}

export function validateCreateTenant(data) {
  return validate(data, createTenantSchema);
}

export function validateUpdateTenant(data) {
  return validate(data, updateTenantSchema);
}
