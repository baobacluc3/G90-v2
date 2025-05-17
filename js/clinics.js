import { apiRequest } from './api.js';

let editingId = null;

async function loadClinics() {
    const result = await apiRequest('/clinics');
    if (result.success) {
        const tableBody = document.getElementById('clinicTableBody');
        tableBody.innerHTML = '';

        result.data.forEach(clinic => {
            const revenueFormatted = Number(clinic.revenue).toLocaleString('vi-VN');
            const statusBadge = clinic.status == 1
                ? `<span class="badge bg-success">Hoạt động</span>`
                : `<span class="badge bg-secondary">Ngừng hoạt động</span>`;

            tableBody.innerHTML += `
                <tr>
                    <td>${clinic.name}</td>
                    <td>${clinic.address}</td>
                    <td>${clinic.phone}</td>
                    <td>${revenueFormatted}</td>
                    <td>${statusBadge}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editClinic('${clinic.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteClinic('${clinic.id}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
    }
}

window.editClinic = async function(id) {
    const result = await apiRequest(`/clinics/${id}`);
    if (result.success) {
        const c = result.data;
        document.getElementById('Id_CoSo').value = c.id;
        document.getElementById('TenCoSo').value = c.name;
        document.getElementById('DiaChi').value = c.address;
        document.getElementById('DienThoai').value = c.phone;
        document.getElementById('DoanhThu').value = c.revenue;
        document.getElementById('TrangThai').value = c.status;
        editingId = c.id;

        window.scrollTo({ top: document.getElementById('clinicForm').offsetTop, behavior: 'smooth' });
    }
}

window.deleteClinic = async function(id) {
    if (confirm('Bạn có chắc muốn xóa cơ sở này?')) {
        const result = await apiRequest(`/clinics/${id}`, 'DELETE');
        if (result.success) loadClinics();
    }
}

document.getElementById('clinicForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clinic = {
        name: document.getElementById('TenCoSo').value,
        address: document.getElementById('DiaChi').value,
        phone: document.getElementById('DienThoai').value,
        revenue: parseInt(document.getElementById('DoanhThu').value),
        status: parseInt(document.getElementById('TrangThai').value)
    };

    const id = document.getElementById('Id_CoSo').value;
    let result;

    if (id) {
        result = await apiRequest(`/clinics/${id}`, 'PUT', clinic);
    } else {
        result = await apiRequest('/clinics', 'POST', clinic);
    }

    if (result.success) {
        document.getElementById('clinicForm').reset();
        editingId = null;
        loadClinics();
    }
});

loadClinics();
