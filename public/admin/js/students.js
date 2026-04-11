let currentId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    document.getElementById('student-form').addEventListener('submit', handleSave);
});

async function loadStudents() {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500 font-medium">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/students');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 6);
            return;
        }
        const students = await res.json();

        if (students.length === 0) {
            tbody.innerHTML = admin.getEmptyStateHtml("O'quvchilar hali qo'shilmagan", 6);
            return;
        }

        tbody.innerHTML = students.map(item => `
            <tr class="hover:bg-gray-50 transition-colors border-b last:border-0">
                <td class="p-4">#${item.id}</td>
                <td class="p-4">
                    <img src="${item.image_url || 'https://via.placeholder.com/40'}" class="w-10 h-10 object-cover rounded-full">
                </td>
                <td class="p-4 font-medium">${item.full_name_uz}</td>
                <td class="p-4 text-gray-600">${item.field_uz}</td>
                <td class="p-4">${item.order}</td>
                <td class="p-4 text-right space-x-2">
                    <button onclick='editStudent(${JSON.stringify(item)})' class="text-blue-600 hover:bg-blue-100 p-2 rounded">✏️</button>
                    <button onclick="deleteStudent(${item.id})" class="text-red-600 hover:bg-red-100 p-2 rounded">🗑️</button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", 6);
    }
}

// --- UTILS ---
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

function openModal(student = null) {
    const isEdit = student !== null && student.id !== undefined;
    currentId = isEdit ? student.id : null;
    document.getElementById('modal-title').textContent = isEdit ? "O'quvchini tahrirlash" : "O'quvchi qo'shish";
    document.getElementById('student-id').value = isEdit ? student.id : '';

    if (isEdit) {
        ['uz', 'ru', 'en'].forEach(lang => {
            document.getElementById(`full_name_${lang}`).value = student[`full_name_${lang}`] || '';
            document.getElementById(`field_${lang}`).value = student[`field_${lang}`] || '';
            document.getElementById(`achievement_${lang}`).value = student[`achievement_${lang}`] || '';
        });
        document.getElementById('order').value = student.order;
    } else {
        document.getElementById('student-form').reset();
        document.getElementById('order').value = "0";
    }

    switchTab('uz');

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modal.classList.remove('hidden');
    void modal.offsetWidth; // Trigger reflow

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
        document.getElementById('student-form').reset();
    }, 300);
}

function editStudent(item) {
    openModal(item);
}

async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();

    ['uz', 'ru', 'en'].forEach(lang => {
        formData.append(`full_name_${lang}`, document.getElementById(`full_name_${lang}`).value);
        formData.append(`field_${lang}`, document.getElementById(`field_${lang}`).value);
        formData.append(`achievement_${lang}`, document.getElementById(`achievement_${lang}`).value);
    });

    formData.append('order', document.getElementById('order').value);

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) formData.append('image', imageFile);

    const url = currentId ? `/students/${currentId}` : '/students';
    const method = currentId ? 'PUT' : 'POST';

    try {
        const res = await admin.fetch(url, {
            method: method,
            body: formData
        });

        if (res && res.ok) {
            closeModal();
            loadStudents();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteStudent(id) {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
        const res = await admin.fetch(`/students/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadStudents();
    } catch (e) { console.error(e); }
}
