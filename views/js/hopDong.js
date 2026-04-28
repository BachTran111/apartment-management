// HopDong Form Handler
class HopDongManager {
    constructor() {
        this.selectedRoom = null;
        this.contractData = {};
        this.init();
    }

    init() {
        this.setCurrentStartDate();
        this.setupEventListeners();
        this.loadRoomData();
    }

    setCurrentStartDate() {
        const today = new Date();
        const startDateInput = document.querySelector('input[name="startDate"]');
        if (startDateInput) {
            startDateInput.value = this.formatDate(today);
            // Tính ngày kết thúc từ ngày hiện tại
            this.calculateEndDate();
        }
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    setupEventListeners() {
        // Room Selection
        document.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectRoom(e));
        });

        // Contract Duration Auto-calculation
        document.querySelector('.duration-select')?.addEventListener('change', (e) => {
            this.calculateEndDate();
        });

        // Start Date Change - Recalculate End Date
        document.querySelector('input[name="startDate"]')?.addEventListener('change', (e) => {
            this.calculateEndDate();
        });

        // Utility Input Handlers
        document.querySelectorAll('.utility-input').forEach(input => {
            input.addEventListener('input', (e) => this.validateNumberInput(e));
        });

        // Deposit Input Handler
        document.querySelector('input[name="deposit"]')?.addEventListener('input', (e) => {
            this.validateNumberInput(e);
        });

        // Asset Quantity Controls
        document.querySelectorAll('.asset-increment').forEach(btn => {
            btn.addEventListener('click', (e) => this.incrementQuantity(e));
        });

        document.querySelectorAll('.asset-decrement').forEach(btn => {
            btn.addEventListener('click', (e) => this.decrementQuantity(e));
        });

        // Asset Checkbox Toggle
        document.querySelectorAll('.asset-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.toggleAsset(e));
        });

        // Submit Form
        document.querySelector('.btn-create-contract')?.addEventListener('click', (e) => {
            this.submitContract(e);
        });

        // File Upload
        document.querySelectorAll('.upload-area').forEach(area => {
            area.addEventListener('click', (e) => this.triggerFileUpload(e));
            area.addEventListener('dragover', (e) => this.handleDragOver(e));
            area.addEventListener('drop', (e) => this.handleFileDrop(e));
        });

        // Image Preview Click to Remove/Change
        document.querySelectorAll('.image-preview').forEach(img => {
            img.addEventListener('click', (e) => this.removeImage(e));
        });

        // Back Button
        document.querySelector('.material-symbols-outlined[data-back]')?.addEventListener('click', (e) => {
            if (window.history.length > 1) {
                window.history.back();
            }
        });
    }

    selectRoom(e) {
        // Remove previous selection
        document.querySelectorAll('.room-card').forEach(card => {
            card.classList.remove('border-2', 'border-primary-container');
        });

        // Add selection to clicked card
        const card = e.currentTarget;
        card.classList.add('border-2', 'border-primary-container');

        // Store selected room data
        this.selectedRoom = {
            id: card.dataset.roomId,
            name: card.querySelector('.room-name').textContent,
            price: card.querySelector('.room-price').textContent,
            area: card.querySelector('.room-area').textContent
        };

        console.log('Selected Room:', this.selectedRoom);
    }

    calculateEndDate() {
        const startDateInput = document.querySelector('input[name="startDate"]');
        const endDateInput = document.querySelector('input[name="endDate"]');
        const durationSelect = document.querySelector('.duration-select');

        if (!startDateInput || !endDateInput || !durationSelect) return;

        const startDate = new Date(startDateInput.value);
        const months = parseInt(durationSelect.value) || 0;

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + months);

        endDateInput.value = this.formatDate(endDate);
    }

    validateNumberInput(e) {
        const value = e.target.value;
        // Remove non-numeric characters except decimal point
        const cleaned = value.replace(/[^\d.]/g, '');
        if (cleaned !== value) {
            e.target.value = cleaned;
        }
    }

    incrementQuantity(e) {
        const button = e.currentTarget;
        const quantitySpan = button.parentElement.querySelector('[class*="text-center"]');
        const currentQty = parseInt(quantitySpan.textContent) || 0;
        quantitySpan.textContent = currentQty + 1;
        this.updateAssetList();
    }

    decrementQuantity(e) {
        const button = e.currentTarget;
        const quantitySpan = button.parentElement.querySelector('[class*="text-center"]');
        const currentQty = parseInt(quantitySpan.textContent) || 0;
        if (currentQty > 0) {
            quantitySpan.textContent = currentQty - 1;
            this.updateAssetList();
        }
    }

    toggleAsset(e) {
        const assetRow = e.currentTarget.closest('[class*="flex"]');
        if (e.target.checked) {
            assetRow.classList.add('opacity-100');
        } else {
            assetRow.classList.add('opacity-50');
        }
    }

    updateAssetList() {
        const assets = [];
        document.querySelectorAll('.asset-checkbox:checked').forEach(checkbox => {
            const row = checkbox.closest('[class*="flex"]');
            const name = row.querySelector('p.font-semibold').textContent;
            const qty = parseInt(row.querySelector('[class*="text-center"]').textContent) || 0;
            if (qty > 0) {
                assets.push({ name, quantity: qty });
            }
        });
        this.contractData.assets = assets;
    }

    triggerFileUpload(e) {
        const uploadArea = e.currentTarget; // Lưu reference của upload area
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', (event) => {
            this.handleFileUpload(event, uploadArea); // Truyền uploadArea đã lưu
        });
        input.click();
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('bg-primary-fixed/10');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-primary-fixed/10');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileUpload({ target: { files } }, e.currentTarget);
        }
    }

    handleFileUpload(e, uploadArea) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            const uploadType = uploadArea.dataset.uploadType;

            reader.onload = (event) => {
                // Hide upload area and show image
                uploadArea.style.display = 'none';

                // Find the image preview element
                const container = uploadArea.closest('.upload-container');
                const imagePreview = container.querySelector('.image-preview');

                if (imagePreview) {
                    imagePreview.src = event.target.result;
                    imagePreview.classList.remove('hidden');
                }

                // Store image data in contractData
                if (!this.contractData.images) {
                    this.contractData.images = {};
                }
                this.contractData.images[uploadType] = {
                    filename: file.name,
                    data: event.target.result
                };

                console.log(`File uploaded (${uploadType}):`, file.name);
            };

            reader.readAsDataURL(file);
        } else {
            alert('Vui lòng chọn file ảnh hợp lệ');
        }
    }

    removeImage(e) {
        const imagePreview = e.currentTarget;
        const container = imagePreview.closest('.upload-container');
        const uploadArea = container.querySelector('.upload-area');

        // Show upload area and hide image
        uploadArea.style.display = '';
        imagePreview.classList.add('hidden');
        imagePreview.src = '';

        console.log('Image removed');
    }

    submitContract(e) {
        e.preventDefault();

        // Validate required fields
        if (!this.selectedRoom) {
            alert('Vui lòng chọn phòng trống');
            return;
        }

        // Gather form data
        const formData = {
            room: this.selectedRoom,
            tenant: {
                name: document.querySelector('[name="tenantName"]')?.value,
                phone: document.querySelector('[name="tenantPhone"]')?.value,
                idNumber: document.querySelector('[name="tenantIdNumber"]')?.value,
                birthDate: document.querySelector('[name="tenantBirthDate"]')?.value,
                gender: document.querySelector('[name="tenantGender"]')?.value,
                address: document.querySelector('[name="tenantAddress"]')?.value,
                idIssueDate: document.querySelector('[name="tenantIdIssueDate"]')?.value,
                idIssuedBy: document.querySelector('[name="tenantIdIssuedBy"]')?.value
            },
            contract: {
                duration: document.querySelector('[name="duration"]')?.value,
                startDate: document.querySelector('[name="startDate"]')?.value,
                endDate: document.querySelector('[name="endDate"]')?.value
            },
            deposit: {
                amount: document.querySelector('[name="deposit"]')?.value || 0,
                note: document.querySelector('[name="depositNote"]')?.value || ''
            },
            utilities: {
                electricity: {
                    price: document.querySelector('[name="electricityPrice"]')?.value,
                    reading: document.querySelector('[name="electricityReading"]')?.value
                },
                water: {
                    price: document.querySelector('[name="waterPrice"]')?.value,
                    reading: document.querySelector('[name="waterReading"]')?.value
                }
            },
            assets: this.contractData.assets || [],
            images: this.contractData.images || {}
        };

        console.log('Contract Data:', formData);

        // Send to backend
        this.saveContract(formData);
    }

    async saveContract(data) {
        try {
            // Uncomment and modify when backend is ready
            // const response = await fetch('/api/hopDong/create', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(data)
            // });

            // if (response.ok) {
            //     alert('Hợp đồng được tạo thành công!');
            //     window.location.href = '/hopDong-list';
            // }

            alert('Dữ liệu hợp đồng:\n' + JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving contract:', error);
            alert('Lỗi khi tạo hợp đồng. Vui lòng thử lại.');
        }
    }

    loadRoomData() {
        // Placeholder for loading room data from backend
        // Uncomment when backend is ready
        // fetch('/api/phong/available')
        //     .then(res => res.json())
        //     .then(data => {
        //         this.renderRooms(data);
        //     });
        console.log('Room data loaded');
    }

    renderRooms(rooms) {
        const container = document.querySelector('[class*="grid-cols-4"]');
        container.innerHTML = '';

        rooms.forEach(room => {
            const card = this.createRoomCard(room);
            container.appendChild(card);
        });
    }

    createRoomCard(room) {
        const div = document.createElement('div');
        div.className = 'room-card bg-surface-container-lowest p-5 rounded-[12px] hover:bg-primary-fixed/20 transition-all cursor-pointer';
        div.dataset.roomId = room.id;

        div.innerHTML = `
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span class="material-symbols-outlined">apartment</span>
                </div>
                <div>
                    <p class="text-xs text-on-surface-variant font-medium">Phòng/Căn hộ</p>
                    <p class="font-bold text-on-surface room-name">${room.name}</p>
                </div>
            </div>
            <div class="flex justify-between items-end">
                <div>
                    <p class="text-xs text-on-surface-variant">Diện tích: <span class="font-semibold text-on-surface room-area">${room.area} m²</span></p>
                    <p class="text-sm font-black text-on-surface mt-1 room-price">${room.price}</p>
                </div>
                <span class="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">Đang trống</span>
            </div>
        `;

        div.addEventListener('click', (e) => this.selectRoom(e));
        return div;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HopDongManager();
});
