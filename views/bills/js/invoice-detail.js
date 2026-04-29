// Mock data array (same as in management page)
const mockInvoices = [
  {
    id: 1,
    name: "Hóa đơn điện tháng 03/2026",
    type: "Điện",
    amount: 1560000,
    date: "2026-03-22",
    status: "Đã thanh toán",
  },
  {
    id: 2,
    name: "Hóa đơn nước tháng 03/2026",
    type: "Nước",
    amount: 245000,
    date: "2026-03-22",
    status: "Đã thanh toán",
  },
  {
    id: 3,
    name: "Internet VNPT Gói Home",
    type: "Internet",
    amount: 350000,
    date: "2026-04-01",
    status: "Chưa thanh toán",
  },
  {
    id: 4,
    name: "Hóa đơn điện tháng 04/2026",
    type: "Điện",
    amount: 1845000,
    date: "2026-04-20",
    status: "Chưa thanh toán",
  },
  {
    id: 5,
    name: "Phí dịch vụ chung cư 2026",
    type: "Dịch vụ",
    amount: 2000000,
    date: "2026-04-15",
    status: "Chưa thanh toán",
  },
  {
    id: 6,
    name: "Tiền WiFi 6 tháng đầu năm",
    type: "Internet",
    amount: 2100000,
    date: "2026-01-10",
    status: "Đã thanh toán",
  },
  {
    id: 7,
    name: "Phiếu thu nước sinh hoạt",
    type: "Nước",
    amount: 115000,
    date: "2026-04-18",
    status: "Chưa thanh toán",
  },
  {
    id: 8,
    name: "Phí quản lý tòa nhà",
    type: "Dịch vụ",
    amount: 800000,
    date: "2026-02-15",
    status: "Đã thanh toán",
  },
  {
    id: 9,
    name: "Internet FPT - Tầng 5",
    type: "Internet",
    amount: 450000,
    date: "2026-03-10",
    status: "Đã thanh toán",
  },
  {
    id: 10,
    name: "Định kỳ tiền điện - P.502",
    type: "Điện",
    amount: 1240000,
    date: "2026-04-12",
    status: "Chưa thanh toán",
  },
];

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");

  // Get invoice ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = parseInt(urlParams.get("id"));

  // Find invoice in mock data
  const invoice = mockInvoices.find((item) => item.id === invoiceId);

  if (invoice) {
    // Populating the fields with real data from mock
    document.getElementById("invoiceName").value = invoice.name;
    document.getElementById("invoiceType").value = invoice.type;
    document.getElementById("invoiceAmount").value = formatter.format(
      invoice.amount,
    );
    document.getElementById("invoiceDate").value = invoice.date;
    document.getElementById("invoiceStatus").value = invoice.status;
    console.log("Viewing Invoice Detail for ID:", invoiceId);
  } else {
    console.warn("Invoice not found for ID:", invoiceId);
  }

  // Redirect to management page
  backBtn.addEventListener("click", () => {
    window.location.href = "invoice-management.html";
  });
});
