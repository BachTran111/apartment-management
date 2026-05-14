const API_BASE_URL = "http://localhost:5000/api";

function getMetadata(payload) {
  return payload?.metadata || payload?.data || null;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("vi-VN");
}

async function loadBillDetail() {
  const billId = new URLSearchParams(window.location.search).get("id");
  if (!billId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/bills/${billId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const payload = await response.json();
    const bill = getMetadata(payload);
    const contract = bill?.hop_dong_id || {};
    const tenant = contract.nguoi_thue_id || {};
    const room = contract.phong_id || {};

    document.getElementById("invoiceName").value =
      tenant.ho_ten || "Chưa rõ người thuê";
    document.getElementById("invoiceType").value =
      room.so_phong ? `Phòng ${room.so_phong}` : "Chưa rõ phòng";
    document.getElementById("invoiceAmount").value = formatCurrency(bill.so_tien);
    document.getElementById("invoiceDate").value = formatDate(bill.ngay_lap);
    document.getElementById("invoiceStatus").value = bill.trang_thai || "N/A";
    document.getElementById("invoiceNote").value =
      bill?.ghi_chu?.trim() || "Chưa có ghi chú";
  } catch (error) {
    console.error("Lỗi tải chi tiết hóa đơn:", error);
    alert("Không thể tải chi tiết hóa đơn");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadBillDetail();
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "BillList.html";
  });
});
