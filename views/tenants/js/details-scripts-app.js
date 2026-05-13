// Non-module version of details-script-api.js

console.log("details-script-app.js loaded!");

const API_BASE_URL = "http://localhost:5000/api";

async function getTenantById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Lỗi lấy chi tiết người thuê:", error);
    return null;
  }
}

function mapTenantData(apiTenant) {
  if (!apiTenant) return null;
  return {
    id: apiTenant._id,
    name: apiTenant.ho_ten || "N/A",
    idCard: apiTenant.cmnd_cccd || "N/A",
    building: apiTenant.phong_id?.building || "N/A",
    room:
      apiTenant.phong_id?.roomNumber || apiTenant.phong_id?.so_phong || "N/A",
    status: apiTenant.trang_thai === "active" ? "Active" : "Inactive",
    phone: apiTenant.so_dien_thoai || "N/A",
    age: apiTenant.tuoi || "N/A",
    hometown: apiTenant.que_quan || "N/A",
    startDate: apiTenant.ngay_bat_dau
      ? new Date(apiTenant.ngay_bat_dau).toLocaleDateString("vi-VN")
      : "N/A",
    endDate: apiTenant.ngay_ket_thuc
      ? new Date(apiTenant.ngay_ket_thuc).toLocaleDateString("vi-VN")
      : "N/A",
    roomPrice: apiTenant.tien_phong?.toLocaleString("vi-VN") || "0",
    emergencyContact: apiTenant.lien_he_khan_cap || "N/A",
    avatar: apiTenant.anh_dai_dien || "",
    contractImages: apiTenant.anh_hop_dong || [],
  };
}

let isLoaded = false;

async function loadTenantDetails() {
  if (isLoaded) return; // Ngăn load lại nhiều lần
  isLoaded = true;

  const urlParams = new URLSearchParams(window.location.search);
  const tenantId = urlParams.get("id");

  if (!tenantId) {
    document.body.innerHTML =
      '<p class="text-center p-4 text-error">Không tìm thấy ID người thuê</p>';
    return;
  }

  try {
    const apiTenant = await getTenantById(tenantId);
    console.log("=== API TENANT DATA ===");
    console.log("API Tenant:", apiTenant);
    console.log("phong_id:", apiTenant?.phong_id);

    const tenant = mapTenantData(apiTenant);
    console.log("=== MAPPED TENANT DATA ===");
    console.log("Mapped Tenant:", tenant);

    if (!tenant) {
      document.body.innerHTML =
        '<p class="text-center p-4 text-error">Không tìm thấy dữ liệu người thuê</p>';
      return;
    }

    // Populate details - với safe check
    const elements = {
      tenantName: tenant.name,
      fullName: tenant.name,
      idCard: tenant.idCard,
      tenantStatus: tenant.status,
      phone: tenant.phone,
      birthDate: tenant.age,
      hometown: tenant.hometown,
      building: `Tòa ${tenant.building} — ${tenant.room}`,
      startDate: tenant.startDate,
      endDate: tenant.endDate,
      roomPrice: tenant.roomPrice + " VNĐ",
      deposit: tenant.roomPrice + " VNĐ",
      emergencyContact: tenant.emergencyContact,
    };

    console.log("=== ELEMENTS TO FILL ===");
    console.log(elements);

    for (const [id, value] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) {
        el.innerText = value;
        console.log(`✓ Filled ${id} = ${value}`);
      } else {
        console.warn(`❌ Element với id="${id}" không tìm thấy`);
      }
    }

    // Avatar
    const avatarEl = document.getElementById("tenantImage");
    if (tenant.avatar) {
      avatarEl.src = tenant.avatar;
    } else {
      avatarEl.src =
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC5AO2UCI7JGd2mr785DAkpdTilUfgNtjOxyLrYjOr5zMp9uEDzCOGIRi8nlMmZHCMqXh7YKlqXR24A71FHSN3hn6rau8K0q68j9LVBRJSEHzhcoMGRP7K1FVehv6uBYbUOwmn2UHqO5Q29RvPAKYzazTDpkgVSB5SR1rsSkTrn_y3H3fFw9TiN3v7rjK3PEWA6pjXQrW0DK1OEFHH82E7ySWnE_-bpYqKfWGIFW-aQYYjIwVMMwlgDm-GszRYJsj1280Fn3wrMovE";
    }
  } catch (error) {
    console.error("Lỗi:", error);
    document.body.innerHTML =
      '<p class="text-center p-4 text-error">Lỗi tải dữ liệu</p>';
  }
}

// Back button handler
function goBack() {
  console.log("goBack called");
  window.history.back();
}

// Load on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded fired");
  loadTenantDetails();

  // Attach event listeners
  const backBtn = document.getElementById("backBtn");
  console.log("backBtn element:", backBtn);
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      console.log("Back button clicked!");
      goBack();
    });
    console.log("Event listener attached to backBtn");
  } else {
    console.error("backBtn not found!");
  }
});

// Export to global scope for onclick handlers
window.goBack = goBack;

// Fallback: if document already loaded, call init immediately
if (document.readyState === "loading") {
  console.log("Document still loading, waiting for DOMContentLoaded");
} else {
  console.log("Document already loaded, calling init now");
  loadTenantDetails();
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      console.log("Back button clicked!");
      goBack();
    });
  }
}
