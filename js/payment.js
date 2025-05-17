import { apiRequest } from './api.js';

let currentPage = 1;
const rowsPerPage = 5;
let sortAsc = true;

const searchBox = document.getElementById('searchBox');
const statusFilter = document.getElementById('statusFilter');
const tableBody = document.getElementById('paymentList');
const pagination = document.getElementById('pagination');
const toast = document.getElementById('toast');

searchBox.addEventListener('input', loadPayments);
statusFilter.addEventListener('change', loadPayments);

async function loadPayments() {
    const search = searchBox.value.trim();
    const status = statusFilter.value;
    const params = new URLSearchParams({
        search,
        status,
        sort: sortAsc ? 'asc' : 'desc',
        page: currentPage,
        limit: rowsPerPage
    });

    const result = await apiRequest(`/payments?${params.toString()}`);
    if (result.success) {
        const data = result.data;
        const total = result.total;

        tableBody.innerHTML = '';
        data.forEach(payment => {
            tableBody.innerHTML += `
                <tr>
                    <td>${payment.id}</td>
                    <td>${payment.invoiceId}</td>
                    <td>${Number(payment.amount).toLocaleString('vi-VN')} VND</td>
                    <td>
                        <select class="form-select" onchange="updatePaymentStatus('${payment.id}', this.value)">
                            <option value="Chờ xác nhận" ${payment.status === 'Chờ xác nhận' ? 'selected' : ''}>Chờ xác nhận</option>
                            <option value="Đã xác nhận" ${payment.status === 'Đã xác nhận' ? 'selected' : ''}>Đã xác nhận</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deletePayment('${payment.id}')">🗑️ Xóa</button>
                    </td>
                </tr>
            `;
        });

        renderPagination(total);
    } else {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Không thể tải dữ liệu</td></tr>`;
    }
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === currentPage ? 'btn-dark' : 'btn-outline-secondary'} mx-1`;
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            loadPayments();
        };
        pagination.appendChild(btn);
    }
}

window.updatePaymentStatus = async function (paymentId, newStatus) {
    const result = await apiRequest(`/payments/${paymentId}/status`, 'PUT', { status: newStatus });
    if (result.success) {
        showToast('✅ Cập nhật thành công!');
    } else {
        showToast('❌ Lỗi khi cập nhật!');
    }
};

window.deletePayment = async function (id) {
    if (confirm('Bạn có chắc muốn xóa thanh toán này?')) {
        const result = await apiRequest(`/payments/${id}`, 'DELETE');
        if (result.success) {
            showToast('✅ Đã xóa!');
            loadPayments();
        } else {
            showToast('❌ Xóa thất bại!');
        }
    }
};

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

window.sortTableByAmount = function () {
    sortAsc = !sortAsc;
    loadPayments();
};

window.exportCSV = function () {
    window.open('/payments/export', '_blank');
};

loadPayments();
