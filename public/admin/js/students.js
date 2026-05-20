let currentId = null;
let allSchedules = [];

document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();
    document.getElementById('schedule-form').addEventListener('submit', handleSave);
});

async function loadSchedules() {
    const tbody = document.getElementById('schedules-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500 font-medium">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/schedules');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 7);
            return;
        }
        allSchedules = await res.json();

        if (allSchedules.length === 0) {
            tbody.innerHTML = admin.getEmptyStateHtml("Jadvallar hali qo'shilmagan", 7);
            return;
        }

        tbody.innerHTML = allSchedules.map(item => `
            <tr class="hover:bg-gray-50 transition-colors border-b last:border-0">
                <td class="p-4 text-center">#${item.id}</td>
                <td class="p-4">
                    <img src="${item.image_url ? '/uploads/' + item.image_url : 'https://via.placeholder.com/40'}" class="w-10 h-10 object-cover rounded-lg shadow-sm border border-gray-100">
                </td>
                <td class="p-4"><span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">${item.course}</span></td>
                <td class="p-4 font-medium text-gray-800">${item.title_uz}</td>
                <td class="p-4 text-center">${item.order}</td>
                <td class="p-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${item.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                </td>
                <td class="p-4 text-right space-x-1">
                    <button onclick="editSchedule(${item.id})" class="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors" title="Tahrirlash">✏️</button>
                    <button onclick="deleteSchedule(${item.id})" class="text-red-600 hover:bg-red-100 p-2 rounded transition-colors" title="O'chirish">🗑️</button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", 7);
    }
}

function switchTab(lang) {
    ['uz', 'ru', 'en'].forEach(l => {
        document.getElementById(`tab-${l}`).classList.add('hidden');
        const btn = document.getElementById(`tab-btn-${l}`);
        btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm', 'font-bold');
        btn.classList.add('text-gray-500', 'font-medium');
    });

    document.getElementById(`tab-${lang}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-btn-${lang}`);
    activeBtn.classList.remove('text-gray-500', 'font-medium');
    activeBtn.classList.add('bg-white', 'text-blue-600', 'shadow-sm', 'font-bold');
}

function openModal(schedule = null) {
    const isEdit = schedule !== null && schedule.id !== undefined;
    currentId = isEdit ? schedule.id : null;
    document.getElementById('modal-title').textContent = isEdit ? "Dars jadvalini tahrirlash" : "Yangi dars jadvali qo'shish";
    document.getElementById('schedule-id').value = isEdit ? schedule.id : '';

    if (isEdit) {
        ['uz', 'ru', 'en'].forEach(lang => {
            document.getElementById(`title_${lang}`).value = schedule[`title_${lang}`] || '';
            document.getElementById(`description_${lang}`).value = schedule[`description_${lang}`] || '';
        });
        document.getElementById('course').value = schedule.course || '';
        document.getElementById('order').value = schedule.order || 0;
        document.getElementById('isActive').checked = schedule.isActive;
    } else {
        document.getElementById('schedule-form').reset();
        document.getElementById('order').value = "0";
        document.getElementById('isActive').checked = true;
    }

    switchTab('uz');

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modalContent.classList.remove('opacity-0', 'scale-95');
    modalContent.classList.add('opacity-100', 'scale-100');
}

function closeModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('schedule-form').reset();
    }, 300);
}

function editSchedule(id) {
    const item = allSchedules.find(s => s.id === id);
    if (item) openModal(item);
}

async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();

    ['uz', 'ru', 'en'].forEach(lang => {
        formData.append(`title_${lang}`, document.getElementById(`title_${lang}`).value);
        formData.append(`description_${lang}`, document.getElementById(`description_${lang}`).value);
    });

    formData.append('course', document.getElementById('course').value);
    formData.append('order', document.getElementById('order').value);
    formData.append('isActive', document.getElementById('isActive').checked);

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) formData.append('image', imageFile);

    const url = currentId ? `/schedules/${currentId}` : '/schedules';
    const method = currentId ? 'PUT' : 'POST';

    try {
        const res = await admin.fetch(url, {
            method: method,
            body: formData
        });

        if (res && res.ok) {
            admin.showGlobalSuccess(currentId ? "Jadval yangilandi" : "Jadval qo'shildi");
            closeModal();
            loadSchedules();
        }
    } catch (err) {
        console.error(err);
        admin.showGlobalError("Saqlashda xatolik!");
    }
}

async function deleteSchedule(id) {
    if (!confirm("Haqiqatan ham ushbu jadvalni o'chirmoqchimisiz?")) return;
    try {
        const res = await admin.fetch(`/schedules/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
            admin.showGlobalSuccess("O'chirildi");
            loadSchedules();
        }
    } catch (e) {
        console.error(e);
        admin.showGlobalError("O'chirishda xatolik!");
    }
}
