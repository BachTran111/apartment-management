const bodyDataset = document.body.dataset;
const params = new URLSearchParams(window.location.search);

const roomForm = document.getElementById("roomForm");
const soPhongInput = document.getElementById("soPhong");
const giaThueInput = document.getElementById("giaThue");
const trangThaiSelect = document.getElementById("trangThai");
const dienTichInput = document.getElementById("dienTich");
const nguoiThueSelect = document.getElementById("nguoiThue");
const hopDongSelect = document.getElementById("hopDong");
const btnCancel = document.getElementById("btnCancel");
const formTitle = document.getElementById("formTitle");

const apiBase = (bodyDataset.apiBase || params.get("apiBase") || "").trim();
const canHoId = (bodyDataset.canHoId || params.get("canHoId") || "").trim();
const phongId = (bodyDataset.phongId || params.get("phongId") || "").trim();
const resolvedApiBase = apiBase || resolveApiBase();

boot();

function resolveApiBase() {
    const explicitBase = params.get("apiBase");
    if (explicitBase) {
        return explicitBase.replace(/\/$/, "");
    }

    const currentHost = window.location.hostname || "localhost";
    if (window.location.port === "5000") {
        return `${window.location.origin}/api/phongs`;
    }

    if (window.location.protocol.startsWith("http")) {
        return `${window.location.protocol}//${currentHost}:5000/api/phongs`;
    }

    return "http://localhost:5000/api/phongs";
}

async function boot() {
    if (!canHoId) {
        alert("Chua co canHoId de xu ly.");
        return;
    }

    btnCancel.addEventListener("click", () => {
        window.location.href = `RoomList.html?canHoId=${canHoId}`;
    });

    roomForm.addEventListener("submit", handleFormSubmit);

    if (phongId) {
        formTitle.textContent = "Chinh sua phong";
        await loadRoomData();
    } else {
        formTitle.textContent = "Them phong moi";
    }
}

async function loadRoomData() {
    try {
        const response = await fetch(`${resolvedApiBase}/${phongId}`);
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Khong the tai du lieu phong");
        }

        const room = payload.metadata.phong || payload.metadata;

        soPhongInput.value = room.so_phong || "";
        giaThueInput.value = formatDecimal(room.gia) || "";
        trangThaiSelect.value = normalizeStatusValue(room.trang_thai);
        dienTichInput.value = room.dien_tich || "";

    } catch (error) {
        alert(error.message);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const payload = {
        can_ho_id: canHoId,
        so_phong: soPhongInput.value.trim(),
        gia: Number(giaThueInput.value),
        trang_thai: trangThaiSelect.value,
        dien_tich: Number(dienTichInput.value)
    };

    try {
        const url = phongId ? `${resolvedApiBase}/${phongId}` : resolvedApiBase;
        const method = phongId ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "Khong the luu phong");
        }

        alert("Luu thong tin phong thanh cong!");
        window.location.href = `RoomList.html?canHoId=${canHoId}`;
    } catch (error) {
        alert(error.message);
    }
}

function formatDecimal(value) {
    if (typeof value === "object" && value !== null && "$numberDecimal" in value) {
        return value.$numberDecimal;
    }
    return value;
}

function normalizeStatusValue(rawStatus) {
    const validStatuses = ["Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng"];
    return validStatuses.includes(rawStatus) ? rawStatus : "Phòng Trống";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function parseJsonResponse(response) {
    const rawText = await response.text();

    try {
        return JSON.parse(rawText);
    } catch (error) {
        throw new Error(
            `API ${response.url} khong tra JSON hop le. Hay kiem tra lai apiBase hoac cong backend.`,
        );
    }
}