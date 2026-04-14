document.addEventListener("DOMContentLoaded", () => {
    const detailContainer = document.getElementById("apartment-detail");
    const urlParams = new URLSearchParams(window.location.search);
    const apartmentId = urlParams.get("id");
    const isEditMode = urlParams.get("mode") === "edit";

    if (!apartmentId) {
        detailContainer.innerHTML = '<div class="error-msg">ID căn hộ không hợp lệ.</div>';
        return;
    }

    const fetchDetail = async () => {
        try {
            // Lấy danh sách để làm pagination (Prev/Next)
            const searchRes = await fetch(`/api/apartments/search`);
            const searchData = await searchRes.json();
            const apartments = searchData.metadata || [];
            
            // Lấy chi tiết căn hộ hiện tại
            const response = await fetch(`/api/apartments/${apartmentId}`);
            if (!response.ok) throw new Error("Không thể tải thông tin căn hộ.");

            const data = await response.json();
            const apt = data.metadata;

            if (apt) {
                const currentIndex = apartments.findIndex(a => a._id === apartmentId);
                const prevApt = apartments[currentIndex - 1];
                const nextApt = apartments[currentIndex + 1];

                if (isEditMode) {
                    renderEditMode(apt);
                } else {
                    renderViewMode(apt, prevApt, nextApt);
                }
            } else {
                detailContainer.innerHTML = '<div class="no-results">Không tìm thấy thông tin căn hộ.</div>';
            }
        } catch (error) {
            detailContainer.innerHTML = `<div class="error-msg">⚠️ Lỗi: ${error.message}</div>`;
        }
    };

    const renderViewMode = (apt, prevApt, nextApt) => {
        const imageUrl = apt.hinh_anh || `https://picsum.photos/seed/${apt._id}/800/200`;
        detailContainer.innerHTML = `
            <div class="nav-pagination" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                ${prevApt ? `<a href="apartment-detail.html?id=${prevApt._id}" class="btn-back"><i class="fa-solid fa-chevron-left"></i> Căn hộ trước</a>` : '<span></span>'}
                ${nextApt ? `<a href="apartment-detail.html?id=${nextApt._id}" class="btn-back">Căn hộ sau <i class="fa-solid fa-chevron-right"></i></a>` : '<span></span>'}
            </div>

            <div class="detail-header-image" style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 20px;">
                <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${apt.ten}" onerror="this.src='https://via.placeholder.com/800x200?text=Apartment+Image'">
            </div>
            <h2 class="page-title">Chi tiết căn hộ: ${apt.ten}</h2>

            <section class="section-card" style="position: relative; padding-bottom: 60px;">
                <div class="section-header">
                    <div class="icon-circle">1</div> THÔNG TIN CĂN HỘ
                </div>
                <div class="info-group">
                    <div class="info-row">
                        <span class="info-label">TÊN CĂN HỘ:</span>
                        <div class="info-value">${apt.ten}</div>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ĐỊA CHỈ:</span>
                        <div class="info-value">${apt.dia_chi}</div>
                    </div>
                    <div class="info-row">
                        <span class="info-label">TRẠNG THÁI:</span>
                        <div class="info-value">${apt.trang_thai || 'Hoạt động'}</div>
                    </div>
                </div>
                <!-- Nút chỉnh sửa ở góc dưới bên phải card -->
                <a href="apartment-detail.html?id=${apt._id}&mode=edit" 
                   style="position: absolute; bottom: 20px; right: 20px; background: #ffc107; color: #000; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 14px;">
                   <i class="fa-solid fa-pencil"></i> Chỉnh sửa
                </a>
            </section>
        `;
    };

    const renderEditMode = (apt) => {
        detailContainer.innerHTML = `
            <h2 class="page-title">Chỉnh sửa căn hộ</h2>
            <section class="section-card">
                <form id="edit-apartment-form">
                    <div class="info-group">
                        <div class="info-row">
                            <span class="info-label">TÊN CĂN HỘ:</span>
                            <input type="text" id="edit-ten" class="form-control" value="${apt.ten}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="info-row" style="margin-top: 15px;">
                            <span class="info-label">ĐỊA CHỈ:</span>
                            <input type="text" id="edit-dia-chi" class="form-control" value="${apt.dia_chi}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                         <div class="info-row" style="margin-top: 15px;">
                            <span class="info-label">TRẠNG THÁI:</span>
                            <select id="edit-trang-thai" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="active" ${apt.trang_thai === 'active' || apt.trang_thai === 'Hoạt động' ? 'selected' : ''}>Hoạt động</option>
                                <option value="maintenance" ${apt.trang_thai === 'maintenance' || apt.trang_thai === 'Bảo trì' ? 'selected' : ''}>Bảo trì</option>
                                <option value="inactive" ${apt.trang_thai === 'inactive' || apt.trang_thai === 'Ngừng hoạt động' ? 'selected' : ''}>Ngừng hoạt động</option>
                            </select>
                        </div>
                        <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="submit" class="btn-action" style="background: #28a745; color: #fff; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-weight: bold; min-width: 120px;">Lưu thay đổi</button>
                            <a href="apartment-detail.html?id=${apt._id}" class="btn-action" style="background: #6c757d; color: #fff; padding: 10px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; text-align: center; min-width: 80px;">Hủy</a>
                        </div>
                    </div>
                </form>
            </section>
        `;

        document.getElementById("edit-apartment-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const updatedData = {
                ten: document.getElementById("edit-ten").value,
                dia_chi: document.getElementById("edit-dia-chi").value,
                trang_thai: document.getElementById("edit-trang-thai").value
            };

            try {
                const res = await fetch(`/api/apartments/${apt._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (res.ok) {
                    alert("Cập nhật thành công!");
                    window.location.href = `apartment-detail.html?id=${apt._id}`;
                } else {
                    alert("Lỗi khi cập nhật!");
                }
            } catch (err) {
                console.error(err);
                alert("Lỗi hệ thống!");
            }
        });
    };

    fetchDetail();
});