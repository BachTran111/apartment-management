document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("apartmentForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            ten: document.getElementById("tenCanHo").value.trim(),
            dia_chi: document.getElementById("diaChi").value.trim(),
            tong_so_phong: Number(document.getElementById("tongSoPhong").value) || 0
        };

        try {
            const response = await fetch("http://localhost:5000/api/canhos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok || response.status === 201) {
                alert("Tạo căn hộ thành công! Chuyển sang màn hình Danh sách Phòng...");
                const newCanHoId = result.metadata._id;

                window.location.href = `RoomList.html?canHoId=${newCanHoId}`;
            } else {
                alert("Lỗi từ server: " + result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Không thể kết nối tới Server. Đảm bảo Backend đang chạy!");
        }
    });
});