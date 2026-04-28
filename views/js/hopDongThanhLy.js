/* ===== hopDongThanhLy.js ===== */

class TerminationManager {
    constructor() {
        // Contract data
        this.contractData = {
            items: [],
            utilities: {
                electricity: { price: 3500, old: 12450, new: 12710, usage: 0, total: 0 },
                water: { price: 18000, old: 458, new: 466, usage: 0, total: 0 }
            },
            damages: 0,
            paymentMethod: 'transfer',
            initialDeposit: 5000000,
            finalRefund: 0
        };

        // Sample items for demonstration
        this.items = [
            { id: 1, name: 'Điều hòa', status: 'good', notes: '', deduction: 0 },
            { id: 2, name: 'Sơn tường', status: 'damaged', notes: 'Vết bẩn lớn diện tích 2m2', deduction: 500000 }
        ];

        this.init();
    }

    init() {
        this.loadItemsTable();
        this.setupEventListeners();
        this.calculateUtilities();
        this.updateFinancialSummary();
    }

    // ===== Items/Equipment Table =====
    loadItemsTable() {
        const table = document.getElementById('itemsTable');
        table.innerHTML = '';

        this.items.forEach((item) => {
            const row = document.createElement('tr');
            row.className = 'equipment-row bg-surface-container-lowest hover:bg-primary-fixed/20 transition-colors';

            const statusBadgeClass = item.status === 'good' ? 'status-badge good' : 'status-badge damaged';
            const statusText = item.status === 'good' ? 'Tốt' : 'Hư hỏng';
            const statusBgClass = item.status === 'good' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container';
            
            const isFilled = item.status === 'damaged' || item.notes !== '';

            row.innerHTML = `
                <td class="px-4 py-4 font-semibold rounded-l-xl">${item.name}</td>
                <td class="px-4 py-4">
                    <button class="status-button px-3 py-1 text-xs font-bold ${statusBgClass} rounded-full transition-all" data-item-id="${item.id}">
                        ${statusText}
                    </button>
                </td>
                <td class="px-4 py-4">
                    <input class="notes-input w-full bg-surface-container-highest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary h-8 text-xs" 
                           data-item-id="${item.id}" 
                           placeholder="Ghi chú..." 
                           type="text"
                           value="${item.notes}"/>
                </td>
                <td class="px-4 py-4 text-right">
                    <input class="deduction-input" 
                           data-item-id="${item.id}"
                           type="number" 
                           value="${Math.round(item.deduction / 1000)}" 
                           data-is-thousands="true"/>
                </td>
                <td class="px-4 py-4 text-center rounded-r-xl">
                    <button class="photo-btn ${isFilled ? 'filled' : ''}" data-item-id="${item.id}">
                        <span class="material-symbols-outlined">photo_camera</span>
                    </button>
                </td>
            `;

            table.appendChild(row);
        });

        this.attachItemListeners();
    }

    attachItemListeners() {
        // Status button listeners
        document.querySelectorAll('.status-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleItemStatus(e));
        });

        // Notes input listeners
        document.querySelectorAll('.notes-input').forEach(input => {
            input.addEventListener('change', (e) => this.updateItemNotes(e));
        });

        // Deduction input listeners
        document.querySelectorAll('.deduction-input').forEach(input => {
            input.addEventListener('change', (e) => this.updateItemDeduction(e));
            input.addEventListener('blur', (e) => this.updateItemDeduction(e));
        });

        // Photo button listeners
        document.querySelectorAll('.photo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.triggerPhotoUpload(e));
        });
    }

    toggleItemStatus(e) {
        const btn = e.currentTarget;
        const itemId = parseInt(btn.dataset.itemId);
        const item = this.items.find(i => i.id === itemId);

        // Toggle status
        if (item.status === 'good') {
            item.status = 'damaged';
            item.deduction = 500000; // Example deduction for damaged items
        } else {
            item.status = 'good';
            item.deduction = 0;
        }

        this.loadItemsTable();
        this.updateFinancialSummary();
    }

    updateItemNotes(e) {
        const input = e.currentTarget;
        const itemId = parseInt(input.dataset.itemId);
        const item = this.items.find(i => i.id === itemId);
        item.notes = input.value;
    }

    updateItemDeduction(e) {
        const input = e.currentTarget;
        const itemId = parseInt(input.dataset.itemId);
        const item = this.items.find(i => i.id === itemId);
        
        // Input is in thousands, convert back to actual amount
        const value = parseInt(input.value) || 0;
        item.deduction = value * 1000;
        
        this.updateFinancialSummary();
    }

    triggerPhotoUpload(e) {
        const btn = e.currentTarget;
        const itemId = parseInt(btn.dataset.itemId);
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (r) => {
                    const item = this.items.find(i => i.id === itemId);
                    item.photo = r.target.result;
                    
                    btn.classList.add('filled');
                    console.log(`Photo uploaded for item ${itemId}`);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    // ===== Utility Calculations =====
    setupEventListeners() {
        // Electricity input
        const electricityNew = document.getElementById('electricityNew');
        if (electricityNew) {
            electricityNew.addEventListener('input', (e) => this.calculateUtilities());
        }

        // Water input
        const waterNew = document.getElementById('waterNew');
        if (waterNew) {
            waterNew.addEventListener('input', (e) => this.calculateUtilities());
        }

        // Payment methods
        document.querySelectorAll('.payment-method').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPaymentMethod(e));
        });

        // Complete button
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', (e) => this.submitTermination(e));
        }

        // Print button
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }

        // Save draft button
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        // Close button
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => window.history.back());
        }
    }

    calculateUtilities() {
        // Electricity
        const electricityNewInput = document.getElementById('electricityNew');
        const electricityNew = parseInt(electricityNewInput.value) || 0;
        const electricityOld = this.contractData.utilities.electricity.old;
        const electricityPrice = this.contractData.utilities.electricity.price;

        const electricityUsage = electricityNew - electricityOld;
        const electricityTotal = electricityUsage * electricityPrice;

        this.contractData.utilities.electricity.new = electricityNew;
        this.contractData.utilities.electricity.usage = electricityUsage;
        this.contractData.utilities.electricity.total = electricityTotal;

        // Update display
        document.getElementById('electricityUsage').textContent = `${electricityUsage} kWh`;
        document.getElementById('electricityTotal').textContent = `${this.formatCurrency(electricityTotal)} VNĐ`;

        // Water
        const waterNewInput = document.getElementById('waterNew');
        const waterNew = parseInt(waterNewInput.value) || 0;
        const waterOld = this.contractData.utilities.water.old;
        const waterPrice = this.contractData.utilities.water.price;

        const waterUsage = waterNew - waterOld;
        const waterTotal = waterUsage * waterPrice;

        this.contractData.utilities.water.new = waterNew;
        this.contractData.utilities.water.usage = waterUsage;
        this.contractData.utilities.water.total = waterTotal;

        // Update display
        document.getElementById('waterUsage').textContent = `${waterUsage} m3`;
        document.getElementById('waterTotal').textContent = `${this.formatCurrency(waterTotal)} VNĐ`;

        this.updateFinancialSummary();
    }

    // ===== Financial Summary =====
    updateFinancialSummary() {
        // Calculate total damages
        const totalDamages = this.items.reduce((sum, item) => sum + item.deduction, 0);
        this.contractData.damages = totalDamages;

        // Get utility totals
        const electricityTotal = this.contractData.utilities.electricity.total;
        const waterTotal = this.contractData.utilities.water.total;

        // Calculate final refund
        const finalRefund = this.contractData.initialDeposit - totalDamages - electricityTotal - waterTotal;
        this.contractData.finalRefund = finalRefund;

        // Update display
        document.getElementById('depositTotal').textContent = `+ ${this.formatCurrency(this.contractData.initialDeposit)}`;
        document.getElementById('damageDeduction').textContent = `- ${this.formatCurrency(totalDamages)}`;
        document.getElementById('electricityDeduction').textContent = `- ${this.formatCurrency(electricityTotal)}`;
        document.getElementById('waterDeduction').textContent = `- ${this.formatCurrency(waterTotal)}`;
        document.getElementById('finalRefund').textContent = this.formatCurrency(finalRefund);
    }

    // ===== Payment Method Selection =====
    selectPaymentMethod(e) {
        const button = e.currentTarget;
        const method = button.dataset.method;

        // Update all buttons
        document.querySelectorAll('.payment-method').forEach(btn => {
            btn.classList.add('inactive');
            btn.style.borderColor = 'transparent';
            btn.style.backgroundColor = '#f1f3fc';
            btn.style.color = '#404752';
        });

        // Activate selected
        button.classList.remove('inactive');
        button.style.borderColor = '#005ea4';
        button.style.backgroundColor = '#d3e4ff';
        button.style.color = '#005ea4';

        this.contractData.paymentMethod = method;
        console.log(`Payment method selected: ${method}`);
    }

    // ===== Form Submission =====
    submitTermination(e) {
        e.preventDefault();

        const terminationData = {
            timestamp: new Date().toISOString(),
            items: this.items.map(item => ({
                id: item.id,
                name: item.name,
                status: item.status,
                notes: item.notes,
                deduction: item.deduction,
                photo: item.photo || null
            })),
            utilities: {
                electricity: {
                    price: this.contractData.utilities.electricity.price,
                    old: this.contractData.utilities.electricity.old,
                    new: this.contractData.utilities.electricity.new,
                    usage: this.contractData.utilities.electricity.usage,
                    total: this.contractData.utilities.electricity.total
                },
                water: {
                    price: this.contractData.utilities.water.price,
                    old: this.contractData.utilities.water.old,
                    new: this.contractData.utilities.water.new,
                    usage: this.contractData.utilities.water.usage,
                    total: this.contractData.utilities.water.total
                }
            },
            financialSummary: {
                initialDeposit: this.contractData.initialDeposit,
                totalDamages: this.contractData.damages,
                electricityCharge: this.contractData.utilities.electricity.total,
                waterCharge: this.contractData.utilities.water.total,
                finalRefund: this.contractData.finalRefund
            },
            paymentMethod: this.contractData.paymentMethod
        };

        console.log('Termination Data:', terminationData);
        
        // Here you would send to backend API
        // Example: POST /api/contracts/terminate
        alert(`Bàn giao thành công!\nSố tiền hoàn trả: ${this.formatCurrency(this.contractData.finalRefund)} VNĐ`);
    }

    exportPDF() {
        const element = document.querySelector('main');
        const today = new Date();
        const dateStr = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
        const filename = `Bien_ban_thanh_ly_hop_dong_${dateStr}.pdf`;

        const options = {
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: false, useCORS: true },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(options).from(element).save();
    }

    saveDraft() {
        const draftData = {
            timestamp: new Date().toISOString(),
            items: this.items,
            utilities: this.contractData.utilities,
            paymentMethod: this.contractData.paymentMethod
        };

        localStorage.setItem('terminationDraft', JSON.stringify(draftData));
        alert('Đã lưu nháp thành công!');
    }

    // ===== Utility Functions =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TerminationManager();
});
