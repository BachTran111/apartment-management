const API_BASE_URL = '/api';
const TENANT_ID = new URLSearchParams(window.location.search).get('id');

let tenantData = null;
let newAvatarFile = null;
let newContractImages = [];

function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
}

function formatDate(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(amount);
}

async function fetchTenantData() {
  if (!TENANT_ID) {
    showToast('Không tìm thấy ID cư dân', 'error');
    setTimeout(() => window.history.back(), 2000);
    return;
  }

  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${TENANT_ID}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tải dữ liệu');
    }

    const result = await response.json();
    tenantData = result.metadata || result;

    populateForm();
  } catch (error) {
    showToast(error.message, 'error');
    setTimeout(() => window.history.back(), 2000);
  } finally {
    hideLoading();
  }
}

function populateForm() {
  document.getElementById('tenant-id').textContent = `ID: ${TENANT_ID}`;

  if (tenantData.anh_dai_dien) {
    document.getElementById('avatar-preview').innerHTML = 
      `<img src="${tenantData.anh_dai_dien}" alt="Avatar" />`;
  }

  if (tenantData.hop_dong && tenantData.hop_dong.length > 0) {
    const activeContract = tenantData.hop_dong.find(h => h.trang_thai === 'active') || tenantData.hop_dong[0];
    document.getElementById('contract-status').value = activeContract.trang_thai || 'active';
    document.getElementById('gia_thue').value = activeContract.gia_thue || '';
    document.getElementById('tien_dat_coc').value = activeContract.tien_dat_coc || '';
    if (activeContract.ngay_bat_dau) {
      document.getElementById('ngay_bat_dau').value = activeContract.ngay_bat_dau.split('T')[0];
    }
    if (activeContract.ngay_ket_thuc) {
      document.getElementById('ngay_ket_thuc').value = activeContract.ngay_ket_thuc.split('T')[0];
    }
  }

  document.getElementById('updated-at').value = formatDateTime(tenantData.updatedAt);

  document.getElementById('ho_ten').value = tenantData.ho_ten || '';
  document.getElementById('tuoi').value = tenantData.tuoi || '';
  document.getElementById('so_dien_thoai').value = tenantData.so_dien_thoai || '';
  document.getElementById('cmnd_cccd').value = tenantData.cmnd_cccd || '';
  document.getElementById('que_quan').value = tenantData.que_quan || '';
  document.getElementById('sdt_lien_he_khan_cap').value = tenantData.sdt_lien_he_khan_cap || '';
  document.getElementById('ghi_chu').value = tenantData.ghi_chu || '';

  if (tenantData.phong) {
    document.getElementById('building-name').value = tenantData.phong.can_ho?.ten_toa_nha || '--';
    document.getElementById('room-number').value = tenantData.phong.so_phong || '--';
  }

  renderContractImages();
}

function renderContractImages() {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';

  if (tenantData.anh_hop_dong && tenantData.anh_hop_dong.length > 0) {
    tenantData.anh_hop_dong.forEach((imagePath, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span>${imagePath.split('/').pop()}</span>
        <button type="button" class="btn-remove-file" data-index="${index}">×</button>
      `;
      fileItem.querySelector('.btn-remove-file').addEventListener('click', () => removeImage(imagePath));
      fileList.appendChild(fileItem);
    });
  }

  const addButton = document.createElement('button');
  addButton.className = 'btn-add-file';
  addButton.type = 'button';
  addButton.textContent = 'Thêm file +';
  addButton.onclick = () => document.getElementById('contract-images-input').click();
  fileList.appendChild(addButton);
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

document.getElementById('avatar-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    newAvatarFile = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('avatar-preview').innerHTML = 
        `<img src="${event.target.result}" alt="Avatar Preview" />`;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('contract-images-input').addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    newContractImages = [...newContractImages, ...files];
    
    files.forEach(file => {
      const fileList = document.getElementById('file-list');
      const addButton = fileList.querySelector('.btn-add-file');
      
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.style.background = '#e8f5e9';
      fileItem.innerHTML = `
        <span>${file.name} (mới)</span>
        <button type="button" class="btn-remove-file" data-filename="${file.name}">×</button>
      `;
      fileItem.querySelector('.btn-remove-file').addEventListener('click', () => {
        newContractImages = newContractImages.filter(f => f.name !== file.name);
        fileItem.remove();
      });
      
      fileList.insertBefore(fileItem, addButton);
    });
  }
});

async function removeImage(imagePath) {
  if (!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${TENANT_ID}/image`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        imagePath,
        imageType: 'anh_hop_dong'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Xóa ảnh thất bại');
    }

    tenantData.anh_hop_dong = tenantData.anh_hop_dong.filter(img => img !== imagePath);
    renderContractImages();
    showToast('Đã xóa ảnh thành công');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

document.getElementById('btn-delete').addEventListener('click', async () => {
  const confirmFirst = confirm(
    'Bạn có chắc chắn muốn xóa cư dân này không? Hành động này không thể hoàn tác!'
  );
  
  if (!confirmFirst) return;

  const confirmSecond = confirm('Xác nhận một lần nữa: Xóa vĩnh viễn dữ liệu?');
  
  if (!confirmSecond) return;

  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${TENANT_ID}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Xóa cư dân thất bại');
    }

    showToast('Đã xóa cư dân thành công');
    setTimeout(() => {
      window.location.href = '/views/tenant-list/index.html';
    }, 1500);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
});

document.getElementById('btn-submit').addEventListener('click', async () => {
  clearErrors();

  const hoTen = document.getElementById('ho_ten').value.trim();
  const soDienThoai = document.getElementById('so_dien_thoai').value.trim();
  const cmndCccd = document.getElementById('cmnd_cccd').value.trim();
  const queQuan = document.getElementById('que_quan').value.trim();
  const sdtKhanCap = document.getElementById('sdt_lien_he_khan_cap').value.trim();

  let hasError = false;

  if (!hoTen) {
    showError('ho_ten', 'Họ tên không được để trống');
    hasError = true;
  }

  if (!soDienThoai) {
    showError('so_dien_thoai', 'Số điện thoại không được để trống');
    hasError = true;
  } else if (!/^[0-9]{10,11}$/.test(soDienThoai)) {
    showError('so_dien_thoai', 'Số điện thoại không hợp lệ (10-11 số)');
    hasError = true;
  }

  if (!cmndCccd) {
    showError('cmnd_cccd', 'CMND/CCCD không được để trống');
    hasError = true;
  }

  if (!queQuan) {
    showError('que_quan', 'Quê quán không được để trống');
    hasError = true;
  }

  if (sdtKhanCap && !/^[0-9]{10,11}$/.test(sdtKhanCap)) {
    showError('sdt_lien_he_khan_cap', 'Số điện thoại không hợp lệ');
    hasError = true;
  }

  if (hasError) return;

  showLoading();

  try {
    const formData = new FormData();

    formData.append('ho_ten', hoTen);
    formData.append('so_dien_thoai', soDienThoai);
    formData.append('cmnd_cccd', cmndCccd);
    formData.append('que_quan', queQuan);

    const tuoi = document.getElementById('tuoi').value;
    if (tuoi) formData.append('tuoi', tuoi);

    if (sdtKhanCap) formData.append('sdt_lien_he_khan_cap', sdtKhanCap);

    const ghiChu = document.getElementById('ghi_chu').value.trim();
    if (ghiChu) formData.append('ghi_chu', ghiChu);

    const giaThue = document.getElementById('gia_thue').value;
    if (giaThue) formData.append('gia_thue', giaThue);

    const tienDatCoc = document.getElementById('tien_dat_coc').value;
    if (tienDatCoc) formData.append('tien_dat_coc', tienDatCoc);

    const ngayKetThuc = document.getElementById('ngay_ket_thuc').value;
    if (ngayKetThuc) formData.append('ngay_ket_thuc', ngayKetThuc);

    if (newAvatarFile) {
      formData.append('anh_dai_dien', newAvatarFile);
    }

    newContractImages.forEach((file) => {
      formData.append('anh_hop_dong', file);
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tenants/${TENANT_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Cập nhật thất bại');
    }

    showToast('Cập nhật dữ liệu thành công!');

    newAvatarFile = null;
    newContractImages = [];

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  fetchTenantData();
});