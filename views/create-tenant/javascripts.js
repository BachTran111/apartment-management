const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const avatarInput = document.getElementById("avatar-input");
  const avatarImg = document.getElementById("avatar-img");

  avatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarImg.src = e.target.result;
        avatarImg.style.background = "none";
      };
      reader.readAsDataURL(file);
    }
  });

  const contractInput = document.getElementById("contract-input");
  const contractImg = document.getElementById("contract-img");

  contractInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        contractImg.src = e.target.result;
        contractImg.alt = "Ảnh hợp đồng";
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("btn-cancel").addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn hủy bỏ các thay đổi?")) {
      window.history.back();
    }
  });

  document.getElementById("btn-save").addEventListener("click", async () => {
    const formData = new FormData();

    formData.append("ho_ten", document.getElementById("name").value);
    formData.append("tuoi", document.getElementById("age").value);
    formData.append("cmnd_cccd", document.getElementById("id-card").value);
    formData.append("so_dien_thoai", document.getElementById("phone").value);
    formData.append("que_quan", document.getElementById("hometown").value);
    formData.append("phong_id", document.getElementById("room-select").value);
    formData.append("ngay_bat_dau", document.getElementById("start-date").value);
    formData.append("ngay_ket_thuc", document.getElementById("end-date").value);
    
    const priceValue = document.getElementById("price").value.replace(/[^0-9]/g, "");
    formData.append("gia_thue", priceValue);
    
    formData.append("sdt_lien_he_khan_cap", document.getElementById("emergency-phone").value);

    const avatarFile = avatarInput.files[0];
    if (avatarFile) {
      formData.append("anh_dai_dien", avatarFile);
    }

    const contractFiles = contractInput.files;
    for (let i = 0; i < contractFiles.length; i++) {
      formData.append("anh_hop_dong", contractFiles[i]);
    }

    if (!formData.get("ho_ten") || !formData.get("phong_id")) {
      alert("Vui lòng nhập tên và chọn phòng!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tenants`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Lưu thông tin thành công!");
        window.location.href = "tenant-management.html";
      } else {
        alert("Lỗi: " + (result.message || "Không thể lưu thông tin"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Lỗi kết nối đến server!");
    }
  });

  loadRooms();
});

async function loadRooms() {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (response.ok) {
      const rooms = await response.json();
      const select = document.getElementById("room-select");
      select.innerHTML = '<option value="">Chọn phòng</option>';
      rooms.forEach((room) => {
        const option = document.createElement("option");
        option.value = room._id;
        option.textContent = `Phòng ${room.so_phong}`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Không thể tải danh sách phòng:", error);
  }
}
