document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("apartmentForm");
  const validationBox = document.getElementById("validationBox");
  const validationList = document.getElementById("validationList");

  const params = new URLSearchParams(window.location.search);
  const canHoId = params.get("canHoId");

  if (canHoId) {
    document.getElementById("mainTitle").innerHTML =
      "<span>1</span> CHỈNH SỬA CĂN HỘ";
    loadApartmentData(canHoId);
  } else {
    document.getElementById("mainTitle").innerHTML =
      "<span>1</span> THÊM CĂN HỘ MỚI";
  }

  document.getElementById("btnCancel").addEventListener("click", () => {
    window.location.href = "apartment-list.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ten: document.getElementById("tenCanHo").value.trim(),
      dia_chi: document.getElementById("diaChi").value.trim(),
      tong_so_phong: Number(
        document.getElementById("tongSoPhong").value.trim(),
      ),
      so_dien_thoai:
        document.getElementById("soDienThoai").value.trim() || null,
      email: document.getElementById("email").value.trim() || null,
      ghi_chu: document.getElementById("ghiChu").value.trim() || null,
    };

    try {
      const url = canHoId ? `/api/apartments/${canHoId}` : "/api/apartments";
      const method = canHoId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok || response.status === 201) {
        alert(`${canHoId ? "Cập nhật" : "Thêm mới"} căn hộ thành công!`);
        window.location.href = "apartment-list.html";
      } else if (response.status === 400) {
        validationBox.style.display = "block";
        validationList.innerHTML = `<li>${result.message}</li>`;
        alert("Lỗi: " + result.message);
      } else {
        alert("Lỗi từ server: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối tới Server.");
    }
  });

  async function loadApartmentData(id) {
    try {
      const res = await fetch(`/api/apartments/${id}`);
      const data = await res.json();
      if (res.ok && data.metadata) {
        const apt = data.metadata;
        document.getElementById("tenCanHo").value = apt.ten || "";
        document.getElementById("diaChi").value = apt.dia_chi || "";
        document.getElementById("tongSoPhong").value = apt.tong_so_phong || "";
        document.getElementById("soDienThoai").value = apt.so_dien_thoai || "";
        document.getElementById("email").value = apt.email || "";
        document.getElementById("ghiChu").value = apt.ghi_chu || "";
      }
    } catch (err) {
      console.error("Lỗi tải data:", err);
    }
  }

  function validateForm() {
    let isValid = true;
    let errors = [];

    const ten = document.getElementById("tenCanHo");
    const diaChi = document.getElementById("diaChi");
    const tongSoPhong = document.getElementById("tongSoPhong");
    const email = document.getElementById("email");
    const phone = document.getElementById("soDienThoai");

    document
      .querySelectorAll(".error-text")
      .forEach((el) => (el.style.display = "none"));
    document
      .querySelectorAll(".form-control")
      .forEach((el) => el.classList.remove("is-invalid"));
    validationList.innerHTML = "";
    validationBox.style.display = "none";

    if (!ten.value.trim()) {
      showError(ten, "errTen", "Tên căn hộ không được để trống");
      errors.push("Tên căn hộ không được để trống");
      isValid = false;
    } else if (ten.value.trim().length < 3) {
      showError(ten, "errTen", "Tên căn hộ phải có ít nhất 3 ký tự");
      errors.push("Tên căn hộ phải có ít nhất 3 ký tự");
      isValid = false;
    } else if (ten.value.trim().length > 255) {
      showError(ten, "errTen", "Tên căn hộ không được vượt quá 255 ký tự");
      errors.push("Tên căn hộ không được vượt quá 255 ký tự");
      isValid = false;
    }

    if (!diaChi.value.trim()) {
      showError(diaChi, "errDiaChi", "Địa chỉ không được để trống");
      errors.push("Địa chỉ không được để trống");
      isValid = false;
    } else if (diaChi.value.trim().length < 5) {
      showError(diaChi, "errDiaChi", "Địa chỉ phải có ít nhất 5 ký tự");
      errors.push("Địa chỉ phải có ít nhất 5 ký tự");
      isValid = false;
    }

    if (!tongSoPhong.value.trim()) {
      showError(tongSoPhong, "errTongSoPhong", "Tổng số phòng là bắt buộc");
      errors.push("Tổng số phòng là bắt buộc");
      isValid = false;
    } else if (isNaN(tongSoPhong.value) || parseInt(tongSoPhong.value) < 1) {
      showError(
        tongSoPhong,
        "errTongSoPhong",
        "Tổng số phòng phải lớn hơn hoặc bằng 1",
      );
      errors.push("Tổng số phòng phải lớn hơn hoặc bằng 1");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() && !emailRegex.test(email.value.trim())) {
      showError(email, "errEmail", "Email sai định dạng");
      errors.push("Email sai định dạng");
      isValid = false;
    }

    const phoneRegex = /^0[0-9]{9,10}$/;
    if (phone.value.trim() && !phoneRegex.test(phone.value.trim())) {
      showError(
        phone,
        "errPhone",
        "Số điện thoại phải chứa 10-11 số và bắt đầu bằng số 0",
      );
      errors.push("Số điện thoại phải chứa 10-11 số và bắt đầu bằng số 0");
      isValid = false;
    }

    if (!isValid) {
      validationBox.style.display = "block";
      errors.forEach((err) => {
        const li = document.createElement("li");
        li.textContent = err;
        validationList.appendChild(li);
      });
      document.querySelector(".validation-title span").textContent =
        errors.length;
    }

    return isValid;
  }

  function showError(inputEl, errId, msg) {
    inputEl.classList.add("is-invalid");
    const errEl = document.getElementById(errId);
    errEl.textContent = msg;
    errEl.style.display = "flex";
  }
});
