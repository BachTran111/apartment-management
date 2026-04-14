document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("apartmentForm");
    const validationBox = document.getElementById("validationBox");
    const validationList = document.getElementById("validationList");

    const params = new URLSearchParams(window.location.search);
    const canHoId = params.get("canHoId");

    if (canHoId) {
        document.getElementById("mainTitle").innerHTML = "<span>1</span> CHỈNH SỬA CĂN HỘ";
        loadApartmentData(canHoId);
    } else {
        document.getElementById("mainTitle").innerHTML = "<span>1</span> THÊM CĂN HỘ MỚI";
    }

    document.getElementById("btnCancel").addEventListener("click", () => {
        window.location.href = "ApartmentList.html";
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            ten: document.getElementById("tenCanHo").value.trim(),
            dia_chi: document.getElementById("diaChi").value.trim(),
            so_dien_thoai: document.getElementById("soDienThoai").value.trim(),
            email: document.getElementById("email").value.trim(),
            ghi_chu: document.getElementById("ghiChu").value.trim()
        };

        try {
            const url = canHoId ? `http://localhost:5000/api/canhos/${canHoId}` : "http://localhost:5000/api/canhos";
            const method = canHoId ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok || response.status === 201) {
                alert(`${canHoId ? 'Cập nhật' : 'Thêm mới'} căn hộ thành công!`);
                window.location.href = "ApartmentList.html";
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
            const res = await fetch(`http://localhost:5000/api/canhos/${id}`);
            const data = await res.json();
            if (res.ok && data.metadata) {
                const apt = data.metadata;
                document.getElementById("tenCanHo").value = apt.ten || "";
                document.getElementById("diaChi").value = apt.dia_chi || "";
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
        const email = document.getElementById("email");
        const phone = document.getElementById("soDienThoai");

        document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
        validationList.innerHTML = "";
        validationBox.style.display = "none";

        if (!ten.value.trim()) {
            showError(ten, "errTen", "Tên căn hộ không được để trống");
            errors.push("Tên căn hộ không được để trống");
            isValid = false;
        }

        if (!diaChi.value.trim()) {
            showError(diaChi, "errDiaChi", "Địa chỉ không được để trống");
            errors.push("Địa chỉ không được để trống");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() && !emailRegex.test(email.value.trim())) {
            showError(email, "errEmail", "Email phải đúng định dạng");
            errors.push("Email phải đúng định dạng");
            isValid = false;
        }

        const phoneRegex = /^[0-9]{10,11}$/;
        if (phone.value.trim() && !phoneRegex.test(phone.value.trim())) {
            showError(phone, "errPhone", "Số điện thoại phải đúng định dạng");
            errors.push("Số điện thoại phải đúng định dạng");
            isValid = false;
        }

        if (!isValid) {
            validationBox.style.display = "block";
            errors.forEach(err => {
                const li = document.createElement("li");
                li.textContent = err;
                validationList.appendChild(li);
            });
        }

        return isValid;
    }

    function showError(inputEl, errId, msg) {
        inputEl.classList.add('is-invalid');
        const errEl = document.getElementById(errId);
        errEl.textContent = msg;
        errEl.style.display = "flex";
    }
});