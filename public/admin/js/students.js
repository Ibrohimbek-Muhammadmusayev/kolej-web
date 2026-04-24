let schedules = [];
let currentTab = 'uz';

document.addEventListener('DOMContentLoaded', () => {
    fetchSchedules();
});

async function fetchSchedules() {
    const res = await admin.fetch('/schedules');
    if (res) {
        schedules = await res.json();
        renderTable();
    }
}

function renderTable() {
    const tbody = document.getElementById('schedules-table-body');
    if (schedules.length === 0) {
        tbody.innerHTML = admin.getEmptyStateHtml("Hozircha jadvallar yo'q", 6);
        return;
    }

    tbody.innerHTML = schedules.map((item, index) => `
        <tr class="hover:bg-gray-50/80 transition-colors">
            <td class="p-5 text-center font-medium text-gray-500">${index + 1}</td>
            <td class="p-5 text-center">
                <div class="w-16 h-12 rounded-lg bg-gray-100 mx-auto overflow-hidden shadow-sm border border-gray-200">
                    ${item.image_url ? `<img src="/uploads/${item.image_url}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">Rasm yo\'q</div>'}
                </div>
            </td>
            <td class="p-5">
                <div class="font-bold text-gray-800">${item.course}</div>
                <div class="text-xs text-gray-500 mt-0.5">${item.title_uz}</div>
            </td>
            <td class="p-5 text-center font-medium">${item.order}</td>
            <td class="p-5 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${item.isActive ? 'Faol' : 'Nofaol'}
                </span>
            </td>
            <td class="p-5 text-right space-x-2">
                <button onclick="editSchedule(${item.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button onclick="deleteSchedule(${item.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

function openModal(id = null) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('schedule-form');

    form.reset();
    document.getElementById('schedule-id').value = '';
    
    if (id) {
        const item = schedules.find(s => s.id === id);
        title.textContent = 'Jadvalni tahrirlash';
        document.getElementById('schedule-id').value = item.id;
        document.getElementById('title_uz').value = item.title_uz || '';
        document.getElementById('title_ru').value = item.title_ru || '';
        document.getElementById('title_en').value = item.title_en || '';
        document.getElementById('description_uz').value = item.description_uz || '';
        document.getElementById('description_ru').value = item.description_ru || '';
        document.getElementById('description_en').value = item.description_en || '';
        document.getElementById('course').value = item.course || '';
        document.getElementById('order').value = item.order || 0;
        document.getElementById('isActive').checked = item.isActive;
    } else {
        title.textContent = 'Yangi jadval qo\'shish';
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    switchTab('uz');
}

function closeModal() {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function switchTab(lang) {
    currentTab = lang;
    ['uz', 'ru', 'en'].forEach(l => {
        document.getElementById(`tab-${l}`).classList.toggle('hidden', l !== lang);
        const btn = document.getElementById(`tab-btn-${l}`);
        if (l === lang) {
            btn.classList.add('bg-white', 'text-blue-600', 'shadow-sm');
            btn.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-200/50');
        } else {
            btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
            btn.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-200/50');
        }
    });
}

async function saveSchedule() {
    const form = document.getElementById('schedule-form');
    const id = document.getElementById('schedule-id').value;
    
    if (!document.getElementById('title_uz').value || !document.getElementById('course').value) {
        alert("Sarlavha va Kursni kiritish majburiy!");
        return;
    }

    const formData = new FormData();
    formData.append('title_uz', document.getElementById('title_uz').value);
    formData.append('title_ru', document.getElementById('title_ru').value);
    formData.append('title_en', document.getElementById('title_en').value);
    formData.append('description_uz', document.getElementById('description_uz').value);
    formData.append('description_ru', document.getElementById('description_ru').value);
    formData.append('description_en', document.getElementById('description_en').value);
    formData.append('course', document.getElementById('course').value);
    formData.append('order', document.getElementById('order').value);
    formData.append('isActive', document.getElementById('isActive').checked);

    const fileInput = document.getElementById('schedule-file');
    if (fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/schedules/${id}` : '/schedules';

    const res = await admin.fetch(url, {
        method,
        body: formData
    });

    if (res) {
        closeModal();
        fetchSchedules();
    }
}

async function deleteSchedule(id) {
    if (confirm("Haqiqatan ham ushbu jadvalni o'chirmoqchimisiz?")) {
        const res = await admin.fetch(`/schedules/${id}`, { method: 'DELETE' });
        if (res) fetchSchedules();
    }
}

function editSchedule(id) {
    openModal(id);
}
